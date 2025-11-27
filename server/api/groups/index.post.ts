import { db } from '~~/server/utils/drizzle'
import { groups } from '~~/server/database/schema'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const { companyId, name, description, createdBy } = await readValidatedBody(event, z.object({
    companyId: z.string(),
    name: z.string(),
    description: z.string().optional(),
    createdBy: z.string()
  }).parse)

  const [newGroup] = await db.insert(groups).values({
    companyId,
    name,
    description: description || null,
    createdBy
  }).returning()

  return newGroup
})


