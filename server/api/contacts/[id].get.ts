import { db } from '~~/server/utils/drizzle'
import { users, groupMembers, groups } from '~~/server/database/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Contact ID is required'
    })
  }

  // Get the contact
  const contact = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, id),
    columns: {
      passwordHash: false // Exclude password hash
    }
  })

  if (!contact) {
    throw createError({
      statusCode: 404,
      message: 'Contact not found'
    })
  }

  // Get their groups
  const userGroups = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(eq(groupMembers.userId, id))

  return {
    ...contact,
    groups: userGroups
  }
})

