import { neon, neonConfig } from "@neondatabase/serverless";

// Neon serverless uses fetch, enable caching
neonConfig.fetchConnectionCache = true;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.warn("[neon] DATABASE_URL not set — falling back to in-memory store");
}

export const sql = databaseUrl ? neon(databaseUrl) : null;

export function isNeonEnabled() {
  return !!sql;
}

export async function testConnection(): Promise<boolean> {
  if (!sql) return false;
  try {
    const rows = await sql`SELECT 1 as ok`;
    return rows[0]?.ok === 1;
  } catch (e) {
    console.error("[neon] testConnection failed:", e);
    return false;
  }
}
