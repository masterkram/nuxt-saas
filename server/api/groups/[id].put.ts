import { db } from '~~/server/utils/drizzle'
import { groups } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { name, description } = body

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Group ID is required'
    })
  }

  if (!name) {
    throw createError({
      statusCode: 400,
      message: 'name is required'
    })
  }

  const [updatedGroup] = await db
    .update(groups)
    .set({
      name,
      description: description || null,
      updatedAt: new Date()
    })
    .where(eq(groups.id, id))
    .returning()

  if (!updatedGroup) {
    throw createError({
      statusCode: 404,
      message: 'Group not found'
    })
  }

  return updatedGroup
})


