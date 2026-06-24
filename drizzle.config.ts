import 'dotenv/config'

import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || 'file:sqlite.db',
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  },
})
