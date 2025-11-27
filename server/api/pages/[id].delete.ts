import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { eq, and } from 'drizzle-orm'
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
    const [deletedPage] = await db
      .delete(tables.pages)
      .where(and(
        eq(tables.pages.id, id),
        eq(tables.pages.companyId, companyId)
      ))
      .returning()

    if (!deletedPage) {
      throw createError({
        statusCode: 404,
        message: 'Page not found'
      })
    }

    return { success: true, id: deletedPage.id }
  } catch (error) {
    console.error('Error deleting page:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to delete page'
    })
  }
})

