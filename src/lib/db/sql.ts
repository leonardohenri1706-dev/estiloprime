import { neon, neonConfig } from "@neondatabase/serverless";

neonConfig.fetchConnectionCache = true;

export const hasDatabaseUrl = !!process.env.DATABASE_URL;
export const sql = hasDatabaseUrl ? neon(process.env.DATABASE_URL!) : null;

export function isDbEnabled() {
  return !!sql;
}

export async function dbQuery<T = unknown>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]> {
  if (!sql) throw new Error("DATABASE_URL not configured");
  // @ts-ignore neon is a tagged template
  return sql(strings, ...values) as Promise<T[]>;
}
