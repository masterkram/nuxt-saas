import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { sql, eq, and, desc } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const id = getRouterParam(event, 'id')
  const query = getQuery(event)

  // Get authenticated user from Supabase
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in'
    })
  }

  const companyId = query.companyId as string

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Page ID is required'
    })
  }

  if (!companyId) {
    throw createError({
      statusCode: 400,
      message: 'Company ID is required'
    })
  }

  // TODO: Verify user has access to this company
  // const hasAccess = await verifyUserCompanyAccess(user.id, companyId)
  // if (!hasAccess) {
  //   throw createError({
  //     statusCode: 403,
  //     message: 'Access denied to this company'
  //   })
  // }

  try {
    const [page] = await db
      .select({
        id: tables.pages.id,
        title: tables.pages.title,
        slug: tables.pages.slug,
        status: tables.pages.status,
        content: tables.pages.content,
        socialEnabled: tables.pages.socialEnabled,
        publishedAt: tables.pages.publishedAt,
        createdAt: tables.pages.createdAt,
        updatedAt: tables.pages.updatedAt,
        createdBy: tables.pages.createdBy,
        creator: {
          id: tables.users.id,
          firstName: tables.users.firstName,
          lastName: tables.users.lastName,
          email: tables.users.email
        }
      })
      .from(tables.pages)
      .leftJoin(tables.users, eq(tables.pages.createdBy, tables.users.id))
      .where(and(
        eq(tables.pages.id, id),
        eq(tables.pages.companyId, companyId)
      ))

    if (!page) {
      throw createError({
        statusCode: 404,
        message: 'Page not found'
      })
    }

    return {
      ...page,
      createdByName: page.creator
        ? `${page.creator.firstName || ''} ${page.creator.lastName || ''}`.trim() || page.creator.email
        : 'Unknown'
    }
  } catch (error) {
    console.error('Error fetching page:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch page'
    })
  }
})

