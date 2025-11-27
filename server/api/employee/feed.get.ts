import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { eq, and, desc, or, inArray, sql } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const query = getQuery(event)

  // Get authenticated user from Supabase
  const supabaseUser = await serverSupabaseUser(event)

  if (!supabaseUser) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in'
    })
  }

  // Get the user from our database
  const [user] = await db
    .select()
    .from(tables.users)
    .where(eq(tables.users.id, supabaseUser.sub))

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  const companyId = user.companyId
  const limit = Number(query.limit) || 20
  const offset = Number(query.offset) || 0

  try {
  // Get groups the user belongs to
    const userGroups = await db
      .select({ groupId: tables.groupMembers.groupId })
      .from(tables.groupMembers)
      .where(eq(tables.groupMembers.userId, user.id))

    const groupIds = userGroups.map(g => g.groupId)

    // Get published pages that are targeted to:
    // 1. All employees (target_type = 'all')
    // 2. Groups the user belongs to
    // 3. Directly to the user
    const publishedPages = await db
      .select({
        id: tables.pages.id,
        title: tables.pages.title,
        slug: tables.pages.slug,
        content: tables.pages.content,
        socialEnabled: tables.pages.socialEnabled,
        publishedAt: tables.pages.publishedAt,
        createdAt: tables.pages.createdAt,
        creator: {
          id: tables.users.id,
          firstName: tables.users.firstName,
          lastName: tables.users.lastName,
        }
      })
      .from(tables.pages)
      .innerJoin(tables.pagePublications, eq(tables.pages.id, tables.pagePublications.pageId))
      .leftJoin(tables.users, eq(tables.pages.createdBy, tables.users.id))
      .leftJoin(tables.publicationTargets, eq(tables.pagePublications.id, tables.publicationTargets.publicationId))
      .where(
        and(
          eq(tables.pages.companyId, companyId),
          eq(tables.pages.status, 'published'),
          or(
            eq(tables.pagePublications.targetType, 'all'),
            and(
              eq(tables.publicationTargets.targetType, 'groups'),
              groupIds.length > 0 ? inArray(tables.publicationTargets.targetId, groupIds) : sql`false`
            ),
            and(
              eq(tables.publicationTargets.targetType, 'contacts'),
              eq(tables.publicationTargets.targetId, user.id)
            )
          )
        )
      )
      .orderBy(desc(tables.pages.publishedAt))
      .limit(limit)
      .offset(offset)

    // Deduplicate pages (in case a page matches multiple criteria)
    const uniquePages = Array.from(new Map(publishedPages.map(p => [p.id, p])).values())

    // Get stats for each page
    const pagesWithStats = await Promise.all(
      uniquePages.map(async (page) => {
        // Check if user has viewed this page
        const [userView] = await db
          .select()
          .from(tables.pageViews)
          .where(
            and(
              eq(tables.pageViews.pageId, page.id),
              eq(tables.pageViews.userId, user.id)
            )
          )
          .limit(1)

        // Get total views
        const [viewCount] = await db
          .select({
            count: sql`COUNT(DISTINCT ${tables.pageViews.userId})`.as('count')
          })
          .from(tables.pageViews)
          .where(eq(tables.pageViews.pageId, page.id))

        // Get reactions count
        const [reactionCount] = await db
          .select({
            count: sql`COUNT(*)`.as('count')
          })
          .from(tables.pageInteractions)
          .where(
            and(
              eq(tables.pageInteractions.pageId, page.id),
              eq(tables.pageInteractions.interactionType, 'reaction')
            )
          )

        // Get comments count
        const [commentCount] = await db
          .select({
            count: sql`COUNT(*)`.as('count')
          })
          .from(tables.pageInteractions)
          .where(
            and(
              eq(tables.pageInteractions.pageId, page.id),
              eq(tables.pageInteractions.interactionType, 'comment')
            )
          )

        // Get user's reaction if any
        const [userReaction] = await db
          .select()
          .from(tables.pageInteractions)
          .where(
            and(
              eq(tables.pageInteractions.pageId, page.id),
              eq(tables.pageInteractions.userId, user.id),
              eq(tables.pageInteractions.interactionType, 'reaction')
            )
          )
          .limit(1)

        // Extract a preview from the content (first paragraph or text)
        let preview = ''
        if (page.content && typeof page.content === 'object' && 'content' in page.content) {
          const contentArray = (page.content as any).content || []
          for (const node of contentArray) {
            if (node.type === 'paragraph' && node.content) {
              preview = node.content
                .filter((n: any) => n.type === 'text')
                .map((n: any) => n.text)
                .join('')
                .slice(0, 200)
              if (preview) break
            }
          }
        }

        return {
          id: page.id,
          title: page.title,
          slug: page.slug,
          preview,
          publishedAt: page.publishedAt,
          socialEnabled: page.socialEnabled,
          author: page.creator
            ? `${page.creator.firstName || ''} ${page.creator.lastName || ''}`.trim() || 'Unknown'
            : 'Unknown',
          hasViewed: !!userView,
          stats: {
            views: Number(viewCount?.count || 0),
            reactions: Number(reactionCount?.count || 0),
            comments: Number(commentCount?.count || 0)
          },
          userReaction: userReaction?.interactionData?.reactionType || null
        }
      })
    )

    return pagesWithStats
  } catch (error) {
    console.error('Error fetching employee feed:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch feed'
    })
  }
})

