import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { eq, and } from 'drizzle-orm'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const db = useDrizzle()
  const validationId = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!validationId) {
    throw createError({
      statusCode: 400,
      message: 'Validation ID is required'
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
    // Get the validation with page info
    const [validation] = await db
      .select({
        validation: tables.validations,
        page: tables.pages
      })
      .from(tables.validations)
      .innerJoin(tables.pages, eq(tables.validations.pageId, tables.pages.id))
      .where(eq(tables.validations.id, validationId))

    if (!validation) {
      throw createError({
        statusCode: 404,
        message: 'Validation not found'
      })
    }

    // Verify the page belongs to user's company
    if (validation.page.companyId !== user.companyId) {
      throw createError({
        statusCode: 403,
        message: 'Access denied'
      })
    }

    // Check if user already responded
    const [existingResponse] = await db
      .select()
      .from(tables.validationResponses)
      .where(
        and(
          eq(tables.validationResponses.validationId, validationId),
          eq(tables.validationResponses.userId, user.id)
        )
      )

    // Process the response based on validation type
    let responseData: any = {}

    if (validation.validation.validationType === 'quiz') {
      // Calculate score for quiz
      const config = validation.validation.config as any
      const questions = config?.questions || []
      let correctAnswers = 0

      const answers = body.answers || {}
      for (const question of questions) {
        const userAnswer = answers[question.id]
        if (userAnswer === question.correctAnswer) {
          correctAnswers++
        }
      }

      const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0
      responseData = {
        answers,
        score,
        passed: score >= 70 // 70% passing threshold
      }
    } else if (validation.validation.validationType === 'confirm') {
      responseData = {
        confirmed: body.confirmed === true
      }
    } else if (validation.validation.validationType === 'survey') {
      responseData = {
        answers: body.answers || {}
      }
    }

    if (existingResponse) {
      // Update existing response
      await db
        .update(tables.validationResponses)
        .set({
          responseData,
          submittedAt: new Date()
        })
        .where(eq(tables.validationResponses.id, existingResponse.id))
    } else {
      // Create new response
      await db.insert(tables.validationResponses).values({
        validationId,
        userId: user.id,
        responseData
      })
    }

    return {
      success: true,
      responseData
    }
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error submitting validation response:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to submit response'
    })
  }
})

