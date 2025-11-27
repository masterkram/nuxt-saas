import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { eq, and, desc, or, inArray, sql } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Page slug is required'
    })
  }

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

  try {
    // Get the page
    const [page] = await db
      .select({
        id: tables.pages.id,
        title: tables.pages.title,
        slug: tables.pages.slug,
        content: tables.pages.content,
        socialEnabled: tables.pages.socialEnabled,
        status: tables.pages.status,
        publishedAt: tables.pages.publishedAt,
        createdAt: tables.pages.createdAt,
        companyId: tables.pages.companyId,
        creator: {
          id: tables.users.id,
          firstName: tables.users.firstName,
          lastName: tables.users.lastName,
        }
      })
      .from(tables.pages)
      .leftJoin(tables.users, eq(tables.pages.createdBy, tables.users.id))
      .where(
        and(
          eq(tables.pages.slug, slug),
          eq(tables.pages.companyId, companyId),
          eq(tables.pages.status, 'published')
        )
      )

    if (!page) {
      throw createError({
        statusCode: 404,
        message: 'Page not found'
      })
    }

    // Verify user has access to this page
    const userGroups = await db
      .select({ groupId: tables.groupMembers.groupId })
      .from(tables.groupMembers)
      .where(eq(tables.groupMembers.userId, user.id))

    const groupIds = userGroups.map(g => g.groupId)

    // Check if page was published to user
    const [publication] = await db
      .select()
      .from(tables.pagePublications)
      .leftJoin(tables.publicationTargets, eq(tables.pagePublications.id, tables.publicationTargets.publicationId))
      .where(
        and(
          eq(tables.pagePublications.pageId, page.id),
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
      .limit(1)

    if (!publication) {
      throw createError({
        statusCode: 403,
        message: 'You do not have access to this page'
      })
    }

    // Get page stats
    const [viewCount] = await db
      .select({
        count: sql`COUNT(DISTINCT ${tables.pageViews.userId})`.as('count')
      })
      .from(tables.pageViews)
      .where(eq(tables.pageViews.pageId, page.id))

    // Get reactions breakdown
    const reactions = await db
      .select({
        reactionType: sql`${tables.pageInteractions.interactionData}->>'reactionType'`.as('reactionType'),
        count: sql`COUNT(*)`.as('count')
      })
      .from(tables.pageInteractions)
      .where(
        and(
          eq(tables.pageInteractions.pageId, page.id),
          eq(tables.pageInteractions.interactionType, 'reaction')
        )
      )
      .groupBy(sql`${tables.pageInteractions.interactionData}->>'reactionType'`)

    const reactionCounts: Record<string, number> = {}
    for (const r of reactions) {
      if (r.reactionType) {
        reactionCounts[r.reactionType as string] = Number(r.count)
      }
    }

    // Get user's reaction
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

    // Get comments
    const comments = await db
      .select({
        id: tables.pageInteractions.id,
        interactionData: tables.pageInteractions.interactionData,
        createdAt: tables.pageInteractions.createdAt,
        user: {
          id: tables.users.id,
          firstName: tables.users.firstName,
          lastName: tables.users.lastName,
          avatarUrl: tables.users.avatarUrl
        }
      })
      .from(tables.pageInteractions)
      .leftJoin(tables.users, eq(tables.pageInteractions.userId, tables.users.id))
      .where(
        and(
          eq(tables.pageInteractions.pageId, page.id),
          eq(tables.pageInteractions.interactionType, 'comment')
        )
      )
      .orderBy(desc(tables.pageInteractions.createdAt))

    // Check for validations and user's responses
    const validationsWithResponses = await db
      .select({
        validation: tables.validations,
        response: tables.validationResponses
      })
      .from(tables.validations)
      .leftJoin(
        tables.validationResponses,
        and(
          eq(tables.validations.id, tables.validationResponses.validationId),
          eq(tables.validationResponses.userId, user.id)
        )
      )
      .where(eq(tables.validations.pageId, page.id))

    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      socialEnabled: page.socialEnabled,
      publishedAt: page.publishedAt,
      author: page.creator
        ? `${page.creator.firstName || ''} ${page.creator.lastName || ''}`.trim() || 'Unknown'
        : 'Unknown',
      stats: {
        views: Number(viewCount?.count || 0),
        reactions: reactionCounts,
        totalReactions: Object.values(reactionCounts).reduce((a, b) => a + b, 0),
        comments: comments.length
      },
      userReaction: userReaction?.interactionData?.reactionType || null,
      comments: comments.map(c => ({
        id: c.id,
        text: c.interactionData?.commentText || '',
        createdAt: c.createdAt,
        author: c.user
          ? `${c.user.firstName || ''} ${c.user.lastName || ''}`.trim() || 'Unknown'
          : 'Unknown',
        authorAvatar: c.user?.avatarUrl || null
      })),
      validations: validationsWithResponses.map(v => ({
        id: v.validation.id,
        type: v.validation.validationType,
        config: v.validation.config,
        required: v.validation.required,
        hasResponded: !!v.response,
        response: v.response?.responseData || null
      }))
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error fetching page:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch page'
    })
  }
})

