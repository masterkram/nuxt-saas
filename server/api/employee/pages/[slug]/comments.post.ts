import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { eq, and } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const slug = getRouterParam(event, 'slug')
  const body = await readBody(event)

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: 'Page slug is required'
    })
  }

  if (!body.text || typeof body.text !== 'string' || body.text.trim().length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Comment text is required'
    })
  }

  if (body.text.length > 2000) {
    throw createError({
      statusCode: 400,
      message: 'Comment text is too long (max 2000 characters)'
    })
  }

  // Get authenticated user from Supabase
  const supabaseUser = await serverSupabaseUser(event)

  if (!supabaseUser) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in'
    })
  }

  // Get the user from our database
  const [user] = await db
    .select()
    .from(tables.users)
    .where(eq(tables.users.id, supabaseUser.sub))

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found'
    })
  }

  try {
    // Get the page
    const [page] = await db
      .select()
      .from(tables.pages)
      .where(
        and(
          eq(tables.pages.slug, slug),
          eq(tables.pages.companyId, user.companyId),
          eq(tables.pages.status, 'published')
        )
      )

    if (!page) {
      throw createError({
        statusCode: 404,
        message: 'Page not found'
      })
    }

    // Check if comments are enabled
    if (!page.socialEnabled?.comments) {
      throw createError({
        statusCode: 403,
        message: 'Comments are disabled for this page'
      })
    }

    // Create the comment
    const [newComment] = await db
      .insert(tables.pageInteractions)
      .values({
        pageId: page.id,
        userId: user.id,
        interactionType: 'comment',
        interactionData: { commentText: body.text.trim() }
      })
      .returning()

    return {
      id: newComment.id,
      text: newComment.interactionData?.commentText || '',
      createdAt: newComment.createdAt,
      author: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown',
      authorAvatar: user.avatarUrl || null
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error adding comment:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to add comment'
    })
  }
})

