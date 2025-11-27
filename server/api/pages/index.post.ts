import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { eq, and, desc } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const body = await readBody(event)
  console.log(body)

  // Get authenticated user from Supabase
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in'
    })
  }

  console.log(user)

  const { companyId, title, content, slug, socialEnabled, status } = body
  const userId = user.sub

  if (!companyId) {
    throw createError({
      statusCode: 400,
      message: 'Company ID is required'
    })
  }

  if (!title) {
    throw createError({
      statusCode: 400,
      message: 'Title is required'
    })
  }

  try {
    // Generate slug from title if not provided
    const pageSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    const [newPage] = await db
      .insert(tables.pages)
      .values({
        companyId,
        createdBy: userId,
        title,
        slug: pageSlug,
        content: content || {},
        socialEnabled: socialEnabled || { reactions: true, comments: true, share: true },
        status: status || 'draft'
      })
      .returning()

    return newPage
  } catch (error) {
    console.error('Error creating page:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create page'
    })
  }
})

