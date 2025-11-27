import { users } from "~~/server/database/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

export default defineEventHandler(async (event) => {
  const payload = await getValidatedRouterParams(event, z.object({
    id: z.string()
  }).parse)

  const db = useDrizzle()

  const user = await db.select().from(users).where(eq(users.id, payload.id as string)).limit(1)

  return user[0]
})