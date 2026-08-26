import { neon } from "@neondatabase/serverless";
const url = process.env.DATABASE_URL;
console.log("url set", !!url);
const sql = neon(url);
console.log("unsafe", typeof sql.unsafe);
try {
  await sql.unsafe("CREATE TABLE IF NOT EXISTS test_mig(id INT PRIMARY KEY)");
  console.log("create ok");
  const r2 = await sql.unsafe("SELECT * FROM test_mig");
  console.log("select unsafe", r2);
  const r = await sql`SELECT * FROM test_mig`;
  console.log("select tag", r);
  const tables = await sql`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename='test_mig'`;
  console.log("pg_tables", tables);
  await sql.unsafe("DROP TABLE test_mig");
  console.log("drop ok");
} catch (e) {
  console.error("err", e.message, e.code, e);
}
