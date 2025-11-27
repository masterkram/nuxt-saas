import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { sql, eq, and, gte } from 'drizzle-orm'
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

  try {
    // Calculate date for "last month" comparison
    const now = new Date()
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())

    // Total Pages (current month vs last month)
    const [currentPagesCount] = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(tables.pages)
      .where(eq(tables.pages.companyId, companyId))

    const [lastMonthPagesCount] = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(tables.pages)
      .where(
        and(
          eq(tables.pages.companyId, companyId),
          sql`${tables.pages.createdAt} < ${lastMonth}`
        )
      )

    const totalPages = Number(currentPagesCount?.count || 0)
    const lastMonthPages = Number(lastMonthPagesCount?.count || 0)
    const pagesChange = lastMonthPages > 0 
      ? Math.round(((totalPages - lastMonthPages) / lastMonthPages) * 100)
      : totalPages > 0 ? 100 : 0

    // Active Employees (current month vs last month)
    const [activeEmployeesCount] = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(tables.users)
      .where(
        and(
          eq(tables.users.companyId, companyId),
          eq(tables.users.status, 'active'),
          eq(tables.users.role, 'employee')
        )
      )

    const [lastMonthActiveEmployeesCount] = await db
      .select({
        count: sql<number>`COUNT(*)`
      })
      .from(tables.users)
      .where(
        and(
          eq(tables.users.companyId, companyId),
          eq(tables.users.status, 'active'),
          eq(tables.users.role, 'employee'),
          sql`${tables.users.createdAt} < ${lastMonth}`
        )
      )

    const activeEmployees = Number(activeEmployeesCount?.count || 0)
    const lastMonthActiveEmployees = Number(lastMonthActiveEmployeesCount?.count || 0)
    const employeesChange = lastMonthActiveEmployees > 0
      ? Math.round(((activeEmployees - lastMonthActiveEmployees) / lastMonthActiveEmployees) * 100)
      : activeEmployees > 0 ? 100 : 0

    // Engagement Rate (users who interacted vs total active employees)
    const [currentEngagedUsers] = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${tables.pageInteractions.userId})`
      })
      .from(tables.pageInteractions)
      .innerJoin(tables.pages, eq(tables.pageInteractions.pageId, tables.pages.id))
      .where(
        and(
          eq(tables.pages.companyId, companyId),
          gte(tables.pageInteractions.createdAt, lastMonth)
        )
      )

    const [lastMonthEngagedUsers] = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${tables.pageInteractions.userId})`
      })
      .from(tables.pageInteractions)
      .innerJoin(tables.pages, eq(tables.pageInteractions.pageId, tables.pages.id))
      .where(
        and(
          eq(tables.pages.companyId, companyId),
          gte(tables.pageInteractions.createdAt, twoMonthsAgo),
          sql`${tables.pageInteractions.createdAt} < ${lastMonth}`
        )
      )

    const currentEngaged = Number(currentEngagedUsers?.count || 0)
    const lastMonthEngaged = Number(lastMonthEngagedUsers?.count || 0)
    const engagementRate = activeEmployees > 0 
      ? Math.round((currentEngaged / activeEmployees) * 100)
      : 0
    const lastMonthEngagementRate = lastMonthActiveEmployees > 0
      ? Math.round((lastMonthEngaged / lastMonthActiveEmployees) * 100)
      : 0
    const engagementChange = lastMonthEngagementRate > 0
      ? engagementRate - lastMonthEngagementRate
      : engagementRate > 0 ? engagementRate : 0

    // Average View Time (in seconds, converted to minutes/seconds)
    const [currentAvgViewTime] = await db
      .select({
        avgTime: sql<number>`AVG(${tables.pageViews.durationSeconds})`
      })
      .from(tables.pageViews)
      .innerJoin(tables.pages, eq(tables.pageViews.pageId, tables.pages.id))
      .where(
        and(
          eq(tables.pages.companyId, companyId),
          gte(tables.pageViews.viewedAt, lastMonth)
        )
      )

    const [lastMonthAvgViewTime] = await db
      .select({
        avgTime: sql<number>`AVG(${tables.pageViews.durationSeconds})`
      })
      .from(tables.pageViews)
      .innerJoin(tables.pages, eq(tables.pageViews.pageId, tables.pages.id))
      .where(
        and(
          eq(tables.pages.companyId, companyId),
          gte(tables.pageViews.viewedAt, twoMonthsAgo),
          sql`${tables.pageViews.viewedAt} < ${lastMonth}`
        )
      )

    const avgViewTimeSeconds = Math.round(Number(currentAvgViewTime?.avgTime || 0))
    const lastMonthAvgViewTimeSeconds = Math.round(Number(lastMonthAvgViewTime?.avgTime || 0))
    const avgViewTimeChange = lastMonthAvgViewTimeSeconds > 0
      ? Math.round(((avgViewTimeSeconds - lastMonthAvgViewTimeSeconds) / lastMonthAvgViewTimeSeconds) * 100)
      : avgViewTimeSeconds > 0 ? 100 : 0

    // Format time as "Xm Ys"
    const minutes = Math.floor(avgViewTimeSeconds / 60)
    const seconds = avgViewTimeSeconds % 60
    const avgViewTime = `${minutes}m ${seconds}s`

    return {
      totalPages: {
        value: totalPages,
        change: pagesChange,
        changeType: pagesChange >= 0 ? 'positive' : 'negative'
      },
      activeEmployees: {
        value: activeEmployees,
        change: employeesChange,
        changeType: employeesChange >= 0 ? 'positive' : 'negative'
      },
      engagementRate: {
        value: engagementRate,
        change: engagementChange,
        changeType: engagementChange >= 0 ? 'positive' : 'negative'
      },
      avgViewTime: {
        value: avgViewTime,
        change: avgViewTimeChange,
        changeType: avgViewTimeChange >= 0 ? 'positive' : 'negative'
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch dashboard stats'
    })
  }
})

