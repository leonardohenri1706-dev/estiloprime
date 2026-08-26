import { getLeads, getCustomers, getLeadsByStage } from "@/lib/db/store";
import PipelineBoard from "@/components/admin/PipelineBoard";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const [leads, customers, byStage] = await Promise.all([getLeads(), getCustomers(), getLeadsByStage()]);
  return <PipelineBoard leads={leads} customers={customers} byStage={byStage} />;
}
