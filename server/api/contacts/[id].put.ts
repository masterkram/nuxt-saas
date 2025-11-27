import { db } from '~~/server/utils/drizzle'
import { users, groupMembers } from '~~/server/database/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const { firstName, lastName, email, status, groupIds } = body

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Contact ID is required'
    })
  }

  // Build update object
  const updateData: any = {
    updatedAt: new Date()
  }

  if (firstName !== undefined) updateData.firstName = firstName
  if (lastName !== undefined) updateData.lastName = lastName
  if (email !== undefined) updateData.email = email
  if (status !== undefined) updateData.status = status

  // Update the user
  const [updatedContact] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning()

  if (!updatedContact) {
    throw createError({
      statusCode: 404,
      message: 'Contact not found'
    })
  }

  // Update groups if specified
  if (groupIds !== undefined && Array.isArray(groupIds)) {
    // Remove all current group memberships
    await db
      .delete(groupMembers)
      .where(eq(groupMembers.userId, id))

    // Add new group memberships
    if (groupIds.length > 0) {
      const memberships = groupIds.map(groupId => ({
        groupId,
        userId: id
      }))

      await db.insert(groupMembers)
        .values(memberships)
        .onConflictDoNothing()
    }
  }

  // Return contact without password hash
  const { passwordHash: _, ...contactWithoutPassword } = updatedContact
  return contactWithoutPassword
})


