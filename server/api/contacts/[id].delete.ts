import { db } from '~~/server/utils/drizzle'
import { users } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Contact ID is required'
    })
  }

  const [deletedContact] = await db
    .delete(users)
    .where(eq(users.id, id))
    .returning()

  if (!deletedContact) {
    throw createError({
      statusCode: 404,
      message: 'Contact not found'
    })
  }

  return { success: true, id: deletedContact.id }
})


