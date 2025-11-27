import { db } from '~~/server/utils/drizzle'
import { groupMembers } from '~~/server/database/schema'
import { eq, and, inArray } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { userIds } = body

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Group ID is required'
    })
  }

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'userIds array is required and must not be empty'
    })
  }

  // Remove multiple members at once
  const result = await db
    .delete(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, id),
        inArray(groupMembers.userId, userIds)
      )
    )
    .returning()

  return {
    success: true,
    removed: result.length
  }
})


