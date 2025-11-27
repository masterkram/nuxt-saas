import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { sql, eq, and, desc } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const query = getQuery(event)

  // Get authenticated user from Supabase
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in'
    })
  }

  const companyId = query.companyId as string

  if (!companyId) {
    throw createError({
      statusCode: 400,
      message: 'Company ID is required'
    })
  }

  // TODO: Verify user has access to this company
  // const hasAccess = await verifyUserCompanyAccess(user.id, companyId)
  // if (!hasAccess) {
  //   throw createError({
  //     statusCode: 403,
  //     message: 'Access denied to this company'
  //   })
  // }

  try {
    const allPages = await db
      .select({
        id: tables.pages.id,
        title: tables.pages.title,
        slug: tables.pages.slug,
        status: tables.pages.status,
        content: tables.pages.content,
        socialEnabled: tables.pages.socialEnabled,
        publishedAt: tables.pages.publishedAt,
        createdAt: tables.pages.createdAt,
        updatedAt: tables.pages.updatedAt,
        createdBy: tables.pages.createdBy,
        creator: {
          id: tables.users.id,
          firstName: tables.users.firstName,
          lastName: tables.users.lastName,
          email: tables.users.email
        }
      })
      .from(tables.pages)
      .leftJoin(tables.users, eq(tables.pages.createdBy, tables.users.id))
      .where(eq(tables.pages.companyId, companyId))
      .orderBy(desc(tables.pages.updatedAt))

    // Get view counts and engagement for each page
    const pagesWithStats = await Promise.all(
      allPages.map(async (page) => {
        const [viewStats] = await db
          .select({
            totalViews: sql`COUNT(DISTINCT ${tables.pageViews.userId})`.as('totalViews')
          })
          .from(tables.pageViews)
          .where(eq(tables.pageViews.pageId, page.id))

        const [interactionStats] = await db
          .select({
            totalInteractions: sql`COUNT(*)`.as('totalInteractions')
          })
          .from(tables.pageInteractions)
          .where(eq(tables.pageInteractions.pageId, page.id))

        return {
          ...page,
          views: Number(viewStats?.totalViews || 0),
          engagement: Number(interactionStats?.totalInteractions || 0),
          createdByName: page.creator
            ? `${page.creator.firstName || ''} ${page.creator.lastName || ''}`.trim() || page.creator.email
            : 'Unknown'
        }
      })
    )

    return pagesWithStats
  } catch (error) {
    console.error('Error fetching pages:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch pages'
    })
  }
})

