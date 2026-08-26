import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_TOKEN } from "@/lib/admin/token";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const authed = cookies().get(ADMIN_COOKIE)?.value === ADMIN_TOKEN;
  if (!authed) redirect("/admin/login");
  return <>{children}</>;
}
