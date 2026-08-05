import { Pool } from "pg"

// Singleton pool — reused across requests in the same process
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL environment variable is not set. Please add your Neon PostgreSQL connection string."
      )
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        // Neon requires SSL
        rejectUnauthorized: false,
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  }
  return pool
}

/**
 * Convenience helper to run a single parameterized query.
 * Returns the rows array.
 */
export async function query<T = any>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool()
  const result = await pool.query(text, params)
  return result.rows as T[]
}

/**
 * Runs a query and returns the first row or null.
 */
export async function queryOne<T = any>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}
