"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { db } from "@/lib/db/store";
import { sql, isDbEnabled } from "@/lib/db/sql";
import { loginSchema } from "@/lib/schemas/admin.schema";
import { ADMIN_COOKIE, ADMIN_TOKEN } from "@/lib/admin/token";

export async function loginSubmit(formData: FormData): Promise<{ error?: string }> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };

  const { email, password } = parsed.data;
  const hash = createHash("sha256").update(password).digest("hex");
  let ok = false;
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT email, pass_hash FROM admin_users WHERE LOWER(email)=LOWER(${email}) LIMIT 1`;
      if (rows.length) {
        const r = rows[0] as any;
        ok = r.pass_hash === hash;
      }
    } catch (e) {
      console.error("[login] Neon failed, fallback to memory", e);
      ok = email.toLowerCase().trim() === db.admin.email && hash === db.admin.passHash;
    }
  } else {
    ok =
      email.toLowerCase().trim() === db.admin.email &&
      hash === db.admin.passHash;
  }
  if (!ok) return { error: "Credenciais inválidas" };

  cookies().set(ADMIN_COOKIE, ADMIN_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/admin/dashboard");
}
