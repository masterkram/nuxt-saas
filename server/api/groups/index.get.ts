import { db } from '~~/server/utils/drizzle'
import { groups, groupMembers, users } from '~~/server/database/schema'
import { eq, and, sql, ilike, or } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const companyId = query.companyId as string
  const search = query.search as string

  if (!companyId) {
    throw createError({
      statusCode: 400,
      message: 'companyId is required'
    })
  }

  // Build the query
  const whereConditions: any[] = [eq(groups.companyId, companyId)]

  if (search) {
    const searchCondition = or(
      ilike(groups.name, `%${search}%`),
      ilike(groups.description, `%${search}%`)
    )
    if (searchCondition) {
      whereConditions.push(searchCondition)
    }
  }

  // Get groups with member count
  const result = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      createdBy: groups.createdBy,
      createdAt: groups.createdAt,
      updatedAt: groups.updatedAt,
      memberCount: sql<number>`count(distinct ${groupMembers.userId})`,
      creatorName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`
    })
    .from(groups)
    .leftJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .leftJoin(users, eq(groups.createdBy, users.id))
    .where(and(...whereConditions))
    .groupBy(groups.id, users.id)
    .orderBy(groups.createdAt)

  return result
})

