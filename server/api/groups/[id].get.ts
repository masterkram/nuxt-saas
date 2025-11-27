import { db } from '~~/server/utils/drizzle'
import { groups, groupMembers, users } from '~~/server/database/schema'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Group ID is required'
    })
  }

  // Get group with member count and creator info
  const [result] = await db
    .select({
      id: groups.id,
      companyId: groups.companyId,
      name: groups.name,
      description: groups.description,
      createdBy: groups.createdBy,
      createdAt: groups.createdAt,
      updatedAt: groups.updatedAt,
      memberCount: sql<number>`count(distinct ${groupMembers.userId})`,
      creatorName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
      creatorEmail: users.email
    })
    .from(groups)
    .leftJoin(groupMembers, eq(groups.id, groupMembers.groupId))
    .leftJoin(users, eq(groups.createdBy, users.id))
    .where(eq(groups.id, id))
    .groupBy(groups.id, users.id)

  if (!result) {
    throw createError({
      statusCode: 404,
      message: 'Group not found'
    })
  }

  return result
})


