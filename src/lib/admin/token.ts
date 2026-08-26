import { createHash } from "crypto";

const secret = process.env.ADMIN_SECRET ?? "estilo-prime-dev-secret";

export const ADMIN_COOKIE = "ep_admin";
export const ADMIN_TOKEN = createHash("sha256").update(secret).digest("hex").slice(0, 32);
