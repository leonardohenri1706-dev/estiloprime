import {
  Banknote, ReceiptText, PackageCheck, TriangleAlert, TrendingUp, TrendingDown,
} from "lucide-react";
import { brl } from "@/lib/admin/format";
import type { MetricsT } from "@/lib/db/store";

const sw = { strokeWidth: 1.5 } as const;

function Delta({ pct }: { pct: number }) {
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded-md border ${
        up
          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
          : "text-rose-400 bg-rose-500/10 border-rose-500/25"
      }`}
    >
      <Icon {...sw} className="w-3 h-3" />
      {up ? "+" : ""}{pct.toFixed(1)}%
    </span>
  );
}

export default function MetricsGrid({ m }: { m: MetricsT }) {
  const cards = [
    {
      label: "Faturamento · 30d",
      value: brl(m.revenue),
      sub: `Ticket médio ${brl(m.avgTicket)}`,
      delta: ((m.revenue - m.prevRevenue) / (m.prevRevenue || 1)) * 100,
      icon: Banknote,
      accent: "text-amber-400",
      ring: "border-amber-500/25 bg-amber-500/[0.07]",
    },
    {
      label: "Comandas geradas",
      value: String(m.orderCount),
      sub: `${m.statusCount.PENDING} aguardando · ${m.statusCount.PREPARING} em separação`,
      delta: ((m.orderCount - m.prevOrderCount) / (m.prevOrderCount || 1)) * 100,
      icon: ReceiptText,
      accent: "text-sky-400",
      ring: "border-sky-500/25 bg-sky-500/[0.07]",
    },
    {
      label: "Peças vendidas",
      value: String(m.itemsSold),
      sub: "Volume despachado no período",
      delta: ((m.itemsSold - m.prevItemsSold) / (m.prevItemsSold || 1)) * 100,
      icon: PackageCheck,
      accent: "text-emerald-400",
      ring: "border-emerald-500/25 bg-emerald-500/[0.07]",
    },
    {
      label: "Alerta de estoque",
      value: String(m.stockAlerts),
      sub: "Variações zeradas ou com menos de 2un",
      delta: null as number | null,
      icon: TriangleAlert,
      accent: m.stockAlerts > 0 ? "text-rose-400" : "text-stone-300",
      ring:
        m.stockAlerts > 0
          ? "border-rose-500/25 bg-rose-500/[0.07]"
          : "border-stone-700 bg-stone-800/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
      {cards.map(({ label, value, sub, delta, icon: Icon, accent, ring }) => (
        <div
          key={label}
          className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 sm:p-5 hover:border-stone-700 transition-colors duration-150"
        >
          <div className="flex items-start justify-between gap-2">
            <span className={`grid place-items-center w-9 h-9 rounded-lg border ${ring}`}>
              <Icon {...sw} className={`w-[18px] h-[18px] ${accent}`} />
            </span>
            {delta !== null && <Delta pct={delta} />}
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight tabular-nums text-stone-50">
            {value}
          </p>
          <p className="mt-1 text-xs font-medium text-stone-300">{label}</p>
          <p className="mt-0.5 text-[11px] text-stone-500 line-clamp-1">{sub}</p>
        </div>
      ))}
    </div>
  );
}
