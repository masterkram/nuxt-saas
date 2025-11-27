import { db } from '~~/server/utils/drizzle'
import { groups } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Group ID is required'
    })
  }

  const [deletedGroup] = await db
    .delete(groups)
    .where(eq(groups.id, id))
    .returning()

  if (!deletedGroup) {
    throw createError({
      statusCode: 404,
      message: 'Group not found'
    })
  }

  return { success: true, id: deletedGroup.id }
})


