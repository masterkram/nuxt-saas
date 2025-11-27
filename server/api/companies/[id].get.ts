import { z } from 'zod'
import { tables } from '~~/server/utils/drizzle'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const payload = await getValidatedRouterParams(event, z.object({
    id: z.string().uuid()
  }).parse)

  const db = useDrizzle()
  const company = await db.select().from(tables.companies).where(eq(tables.companies.id, payload.id as string)).limit(1) 

  return company[0]
})