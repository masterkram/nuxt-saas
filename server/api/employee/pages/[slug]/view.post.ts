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

    // Record the view
    await db.insert(tables.pageViews).values({
      pageId: page.id,
      userId: user.id,
      viewedAt: new Date(),
      durationSeconds: body.durationSeconds || null
    })

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error recording view:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to record view'
    })
  }
})

