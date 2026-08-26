import { getCommunications, getCustomers, getLeads } from "@/lib/db/store";
import CommunicationsLog from "@/components/admin/CommunicationsLog";

export const dynamic = "force-dynamic";

export default async function ComunicacoesPage() {
  const [communications, customers, leads] = await Promise.all([getCommunications(), getCustomers(), getLeads()]);
  return (
    <CommunicationsLog
      communications={communications}
      customers={customers}
      leads={leads}
    />
  );
}
