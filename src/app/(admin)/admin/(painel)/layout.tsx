import AdminToaster from "@/components/admin/AdminToaster";
import AdminShell from "@/components/admin/AdminShell";
import Gate from "./gate";

export const metadata = { title: "Painel · Estilo Prime" };

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Gate>
      <AdminShell>{children}</AdminShell>
      <AdminToaster />
    </Gate>
  );
}
