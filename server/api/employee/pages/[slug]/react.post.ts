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

  const validReactions = ['like', 'love', 'celebrate', 'insightful', 'support']
  if (!body.reactionType || !validReactions.includes(body.reactionType)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid reaction type'
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

    // Check if reactions are enabled
    if (!page.socialEnabled?.reactions) {
      throw createError({
        statusCode: 403,
        message: 'Reactions are disabled for this page'
      })
    }

    // Check if user already reacted
    const [existingReaction] = await db
      .select()
      .from(tables.pageInteractions)
      .where(
        and(
          eq(tables.pageInteractions.pageId, page.id),
          eq(tables.pageInteractions.userId, user.id),
          eq(tables.pageInteractions.interactionType, 'reaction')
        )
      )

    if (existingReaction) {
      // Update existing reaction
      await db
        .update(tables.pageInteractions)
        .set({
          interactionData: { reactionType: body.reactionType }
        })
        .where(eq(tables.pageInteractions.id, existingReaction.id))
    } else {
      // Create new reaction
      await db.insert(tables.pageInteractions).values({
        pageId: page.id,
        userId: user.id,
        interactionType: 'reaction',
        interactionData: { reactionType: body.reactionType }
      })
    }

    return { success: true, reactionType: body.reactionType }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error adding reaction:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to add reaction'
    })
  }
})

