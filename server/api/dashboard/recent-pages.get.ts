import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { sql, eq, desc } from 'drizzle-orm'
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
  const limit = Number(query.limit) || 5

  if (!companyId) {
    throw createError({
      statusCode: 400,
      message: 'Company ID is required'
    })
  }

  try {
    // Fetch recent pages ordered by updatedAt
    const recentPages = await db
      .select({
        id: tables.pages.id,
        title: tables.pages.title,
        slug: tables.pages.slug,
        status: tables.pages.status,
        publishedAt: tables.pages.publishedAt,
        updatedAt: tables.pages.updatedAt
      })
      .from(tables.pages)
      .where(eq(tables.pages.companyId, companyId))
      .orderBy(desc(tables.pages.updatedAt))
      .limit(limit)

    // Get view counts and engagement for each page
    const pagesWithStats = await Promise.all(
      recentPages.map(async (page) => {
        const [viewStats] = await db
          .select({
            totalViews: sql<number>`COUNT(DISTINCT ${tables.pageViews.userId})`
          })
          .from(tables.pageViews)
          .where(eq(tables.pageViews.pageId, page.id))

        const [interactionStats] = await db
          .select({
            totalInteractions: sql<number>`COUNT(*)`
          })
          .from(tables.pageInteractions)
          .where(eq(tables.pageInteractions.pageId, page.id))

        return {
          id: page.id,
          title: page.title,
          status: page.status,
          views: Number(viewStats?.totalViews || 0),
          engagement: Number(interactionStats?.totalInteractions || 0),
          publishedAt: page.publishedAt
        }
      })
    )

    return pagesWithStats
  } catch (error) {
    console.error('Error fetching recent pages:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch recent pages'
    })
  }
})

