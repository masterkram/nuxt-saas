import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { eq, and } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  // Get authenticated user from Supabase
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in'
    })
  }

  const { companyId, title, content, slug, socialEnabled, status } = body

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
    const updateData: any = {
      updatedAt: new Date()
    }

    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (slug !== undefined) updateData.slug = slug
    if (socialEnabled !== undefined) updateData.socialEnabled = socialEnabled
    if (status !== undefined) {
      updateData.status = status
      // Set publishedAt when changing status to published
      if (status === 'published') {
        updateData.publishedAt = new Date()
      }
    }

    const [updatedPage] = await db
      .update(tables.pages)
      .set(updateData)
      .where(and(
        eq(tables.pages.id, id),
        eq(tables.pages.companyId, companyId)
      ))
      .returning()

    if (!updatedPage) {
      throw createError({
        statusCode: 404,
        message: 'Page not found'
      })
    }

    return updatedPage
  } catch (error) {
    console.error('Error updating page:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to update page'
    })
  }
})

