import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { eq, and } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

interface PublishBody {
  targetType: 'all' | 'groups' | 'contacts'
  targetIds?: string[] // Group IDs or Contact IDs based on targetType
  notifyEmail: boolean
  notifyPush: boolean
}

export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const pageId = getRouterParam(event, 'id')
  const body = await readBody<PublishBody>(event)

  if (!pageId) {
    throw createError({
      statusCode: 400,
      message: 'Page ID is required'
    })
  }

  // Validate body
  if (!body.targetType || !['all', 'groups', 'contacts'].includes(body.targetType)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid target type'
    })
  }

  if ((body.targetType === 'groups' || body.targetType === 'contacts') && 
      (!body.targetIds || body.targetIds.length === 0)) {
    throw createError({
      statusCode: 400,
      message: `Please select at least one ${body.targetType === 'groups' ? 'group' : 'contact'}`
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

  // Verify user is admin
  if (!['admin', 'super_admin', 'editor'].includes(user.role)) {
    throw createError({
      statusCode: 403,
      message: 'Only admins can publish pages'
    })
  }

  try {
    // Get the page and verify it belongs to user's company
    const [page] = await db
      .select()
      .from(tables.pages)
      .where(
        and(
          eq(tables.pages.id, pageId),
          eq(tables.pages.companyId, user.companyId)
        )
      )

    if (!page) {
      throw createError({
        statusCode: 404,
        message: 'Page not found'
      })
    }

    // Update the page status to published
    await db
      .update(tables.pages)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(tables.pages.id, pageId))

    // Create the publication record
    const [publication] = await db
      .insert(tables.pagePublications)
      .values({
        pageId,
        publishedBy: user.id,
        targetType: body.targetType,
        notifyEmail: body.notifyEmail || false,
        notifyPush: body.notifyPush || false,
        publishedAt: new Date()
      })
      .returning()

    // Create publication targets if specific groups or contacts
    if (body.targetType !== 'all' && body.targetIds && body.targetIds.length > 0) {
      const targetRecords = body.targetIds.map(targetId => ({
        publicationId: publication.id,
        targetType: body.targetType,
        targetId
      }))

      await db.insert(tables.publicationTargets).values(targetRecords)
    }

    // TODO: Send notifications if enabled
    // This would integrate with email/push notification services
    if (body.notifyEmail) {
      console.log('Email notifications would be sent here')
      // await sendEmailNotifications(publication, body.targetType, body.targetIds)
    }

    if (body.notifyPush) {
      console.log('Push notifications would be sent here')
      // await sendPushNotifications(publication, body.targetType, body.targetIds)
    }

    return {
      success: true,
      message: 'Page published successfully',
      publication: {
        id: publication.id,
        pageId: publication.pageId,
        publishedAt: publication.publishedAt,
        targetType: publication.targetType
      }
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error publishing page:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to publish page'
    })
  }
})

