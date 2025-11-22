import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';
import * as relations from '../database/relations';

export { sql, eq, and, or } from 'drizzle-orm';

// Combine schema tables and relations for proper Drizzle initialization
const fullSchema = {
  ...schema,
  ...relations,
};

export function useDrizzle() {
  if (!process.env.DATABASE_URL) {
    throw Error('No DATABASE_URL found. Please add it from supabase.');
  }
  return drizzle(process.env.DATABASE_URL, { schema: fullSchema });
}

export const tables = schema;
// Example: export types
// export type User = typeof schema.users.$inferInsert;