import { getCustomers } from "@/lib/db/store";
import CustomersTable from "@/components/admin/CustomersTable";
import CustomerFormDialog from "@/components/admin/CustomerFormDialog";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const customers = await getCustomers();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs text-stone-500 tabular-nums">{customers.length} cliente(s)</p>
        <div className="ml-auto">
          <CustomerFormDialog />
        </div>
      </div>
      <CustomersTable customers={customers} />
    </div>
  );
}
