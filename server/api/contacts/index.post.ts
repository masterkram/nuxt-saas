import { db } from '~~/server/utils/drizzle'
import { users, groupMembers } from '~~/server/database/schema'
import { createHash } from 'crypto'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { companyId, firstName, lastName, email, groupIds } = body

  if (!companyId || !firstName || !lastName || !email) {
    throw createError({
      statusCode: 400,
      message: 'companyId, firstName, lastName, and email are required'
    })
  }

  // Check if email already exists for this company
  const existingUser = await db.query.users.findFirst({
    where: (u, { and, eq }) => and(
      eq(u.companyId, companyId),
      eq(u.email, email)
    )
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: 'A contact with this email already exists'
    })
  }

  // Generate a temporary password (in production, you'd send an invite email)
  const tempPassword = Math.random().toString(36).slice(-8)
  const passwordHash = createHash('sha256').update(tempPassword).digest('hex')

  // Create the user
  const [newContact] = await db.insert(users).values({
    companyId,
    firstName,
    lastName,
    email,
    passwordHash,
    role: 'employee',
    status: 'active'
  }).returning()

  // Add to groups if specified
  if (groupIds && Array.isArray(groupIds) && groupIds.length > 0) {
    const memberships = groupIds.map(groupId => ({
      groupId,
      userId: newContact.id
    }))

    await db.insert(groupMembers)
      .values(memberships)
      .onConflictDoNothing()
  }

  // Return contact without password hash
  const { passwordHash: _, ...contactWithoutPassword } = newContact

  return {
    ...contactWithoutPassword,
    tempPassword // In production, don't return this - send via email
  }
})

