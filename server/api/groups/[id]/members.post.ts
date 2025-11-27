import { db } from '~~/server/utils/drizzle'
import { groupMembers } from '~~/server/database/schema'

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

  // Insert multiple members at once
  const members = userIds.map(userId => ({
    groupId: id,
    userId
  }))

  try {
    const result = await db
      .insert(groupMembers)
      .values(members)
      .onConflictDoNothing() // Skip if member already exists
      .returning()

    return {
      success: true,
      added: result.length,
      skipped: userIds.length - result.length
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: 'Failed to add members to group'
    })
  }
})


