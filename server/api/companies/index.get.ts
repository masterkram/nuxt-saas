/**
 * GET /api/companies
 * Fetch the company for the authenticated user
 * 
 * Note: Each user belongs to exactly one company (users.companyId)
 */

import { eq } from 'drizzle-orm'
import { companies, users } from '~~/server/database/schema'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Get authenticated user from Supabase
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in'
    })
  }

  try {
    const db = useDrizzle()

    // Fetch the user record to get their companyId
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, user.sub))
      .limit(1)

    if (!userRecord || userRecord.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    const userCompanyId = userRecord[0].companyId

    // Fetch the user's company
    const userCompany = await db
      .select({
        id: companies.id,
        name: companies.name,
        slug: companies.slug,
        brandingConfig: companies.brandingConfig,
        subscriptionTier: companies.subscriptionTier,
        status: companies.status,
      })
      .from(companies)
      .where(eq(companies.id, userCompanyId))
      .limit(1)

    if (!userCompany || userCompany.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Company not found'
      })
    }

    // Return as array for backward compatibility with existing code
    return userCompany
  } catch (error) {
    console.error('Error fetching company:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch company'
    })
  }
})

