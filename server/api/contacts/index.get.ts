import { db } from '~~/server/utils/drizzle'
import { users, groupMembers, groups } from '~~/server/database/schema'
import { eq, and, ilike, or, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const companyId = query.companyId as string
  const search = query.search as string
  const status = query.status as string

  if (!companyId) {
    throw createError({
      statusCode: 400,
      message: 'companyId is required'
    })
  }

  // Build where conditions
  const whereConditions: any[] = [
    eq(users.companyId, companyId),
    eq(users.role, 'employee')
  ]

  if (status && status !== 'all') {
    whereConditions.push(eq(users.status, status as 'active' | 'inactive' | 'suspended'))
  }

  if (search) {
    const searchCondition = or(
      ilike(users.firstName, `%${search}%`),
      ilike(users.lastName, `%${search}%`),
      ilike(users.email, `%${search}%`)
    )
    if (searchCondition) {
      whereConditions.push(searchCondition)
    }
  }

  // Get contacts with their groups
  const contacts = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      avatarUrl: users.avatarUrl,
      status: users.status,
      lastLogin: users.lastLogin,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      groupCount: sql<number>`count(distinct ${groupMembers.groupId})`
    })
    .from(users)
    .leftJoin(groupMembers, eq(users.id, groupMembers.userId))
    .where(and(...whereConditions))
    .groupBy(users.id)
    .orderBy(users.createdAt)

  // For each contact, get their groups
  const contactsWithGroups = await Promise.all(
    contacts.map(async (contact) => {
      const userGroups = await db
        .select({
          id: groups.id,
          name: groups.name
        })
        .from(groupMembers)
        .innerJoin(groups, eq(groupMembers.groupId, groups.id))
        .where(eq(groupMembers.userId, contact.id))

      return {
        ...contact,
        groups: userGroups
      }
    })
  )

  return contactsWithGroups
})

