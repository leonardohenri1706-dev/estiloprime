import { Suspense } from "react";
import { RangeSwitch, RevenueChart, CategoryDonut, ZoneBars } from "@/components/admin/Charts";
import MetricsGrid from "@/components/admin/MetricsGrid";
import CrmMetricsGrid, { PipelineSummary, SourceSplit } from "@/components/admin/CrmMetricsGrid";
import { PendingOrdersCard, RupturesCard } from "@/components/admin/AlertsPanel";
import { getMetrics, getPendingOrders, getRuptures, getCRMStats } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { range?: string };
}) {
  const range: 7 | 30 = searchParams?.range === "7" ? 7 : 30;
  const m = await getMetrics(range);
  const pending = await getPendingOrders();
  const ruptures = await getRuptures();
  const crm = await getCRMStats();

  return (
    <div className="space-y-4 sm:space-y-5">
      <Suspense fallback={<div className="h-11 w-40 animate-pulse rounded-lg bg-stone-900" />}>
        <RangeSwitch current={range} />
      </Suspense>

      <MetricsGrid m={m} />

      <CrmMetricsGrid stats={crm} />

      <RevenueChart series={m.series} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <CategoryDonut data={m.categorySplit} />
        <ZoneBars data={m.zoneSplit} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <PipelineSummary stats={crm} />
        <SourceSplit stats={crm} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <PendingOrdersCard
          orders={pending.map((o) => ({
            id: o.id, orderNumber: o.orderNumber, customerName: o.customerName,
            totalAmount: o.totalAmount, createdAt: o.createdAt, customerPhone: o.customerPhone,
          }))}
        />
        <RupturesCard
          items={ruptures.map(({ product, minStock }) => ({ id: product.id, name: product.name, minStock }))}
        />
      </div>
    </div>
  );
}
