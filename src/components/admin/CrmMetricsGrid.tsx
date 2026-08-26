"use client";

import { Users, GitBranch, TrendingUp, Target, Phone, Banknote } from "lucide-react";
import { brl } from "@/lib/admin/format";
import { LEAD_STAGE_META, type LeadStageEnum } from "@/lib/schemas/admin.schema";
import type { CRMStatsT } from "@/lib/db/store";

const sw = { strokeWidth: 1.5 } as const;

export default function CrmMetricsGrid({ stats }: { stats: CRMStatsT }) {
  const cards = [
    {
      label: "Total de Clientes",
      value: String(stats.totalCustomers),
      sub: `${stats.newCustomers30d} novos nos últimos 30 dias`,
      icon: Users,
      accent: "text-amber-400",
      ring: "border-amber-500/25 bg-amber-500/[0.07]",
    },
    {
      label: "Leads Ativos",
      value: String(stats.activeLeads),
      sub: `${stats.totalLeads} leads no total`,
      icon: GitBranch,
      accent: "text-sky-400",
      ring: "border-sky-500/25 bg-sky-500/[0.07]",
    },
    {
      label: "Taxa de Conversão",
      value: `${stats.conversionRate}%`,
      sub: `${stats.won} ganhos · ${stats.lost} perdidos`,
      icon: Target,
      accent: stats.conversionRate >= 50 ? "text-emerald-400" : "text-amber-400",
      ring: stats.conversionRate >= 50
        ? "border-emerald-500/25 bg-emerald-500/[0.07]"
        : "border-amber-500/25 bg-amber-500/[0.07]",
    },
    {
      label: "Valor do Pipeline",
      value: brl(stats.pipelineValue),
      sub: `Ganho: ${brl(stats.wonValue)}`,
      icon: Banknote,
      accent: "text-violet-400",
      ring: "border-violet-500/25 bg-violet-500/[0.07]",
    },
    {
      label: "Interações",
      value: String(stats.totalComms),
      sub: "Registros de comunicação",
      icon: Phone,
      accent: "text-emerald-400",
      ring: "border-emerald-500/25 bg-emerald-500/[0.07]",
    },
    {
      label: "Leads Ganhos",
      value: String(stats.won),
      sub: `${stats.lost} perdidos no funil`,
      icon: TrendingUp,
      accent: "text-emerald-400",
      ring: "border-emerald-500/25 bg-emerald-500/[0.07]",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
      {cards.map(({ label, value, sub, icon: Icon, accent, ring }) => (
        <div
          key={label}
          className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 sm:p-5 hover:border-stone-700 transition-colors duration-150"
        >
          <div className="flex items-start justify-between gap-2">
            <span className={`grid place-items-center w-9 h-9 rounded-lg border ${ring}`}>
              <Icon {...sw} className={`w-[18px] h-[18px] ${accent}`} />
            </span>
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

export function PipelineSummary({ stats }: { stats: CRMStatsT }) {
  const maxCount = Math.max(...stats.stageValues.map((s) => s.count), 1);
  return (
    <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 sm:p-5">
      <h2 className="text-sm font-semibold tracking-tight mb-4">Funil de Vendas</h2>
      <ul className="space-y-3">
        {stats.stageValues.map((s) => {
          const meta = LEAD_STAGE_META[s.stage as LeadStageEnum];
          return (
            <li key={s.stage}>
              <div className="flex justify-between items-baseline text-xs mb-1">
                <span className={meta.color}>{meta.label}</span>
                <span className="tabular-nums text-stone-400 font-medium">
                  {s.count} · {brl(s.value)}
                </span>
              </div>
              <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max((s.count / maxCount) * 100, 3)}%`,
                    background: meta.color.includes("emerald") ? "#34d399"
                      : meta.color.includes("amber") ? "#fbbf24"
                      : meta.color.includes("sky") ? "#38bdf8"
                      : meta.color.includes("violet") ? "#a78bfa"
                      : meta.color.includes("rose") ? "#fb7185"
                      : "#78716c",
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function SourceSplit({ stats }: { stats: CRMStatsT }) {
  return (
    <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 sm:p-5">
      <h2 className="text-sm font-semibold tracking-tight mb-4">Leads por Fonte</h2>
      <ul className="space-y-2">
        {stats.sourceSplit.map((s) => (
          <li key={s.source} className="flex items-center justify-between text-xs">
            <span className="text-stone-300">{s.source}</span>
            <span className="tabular-nums font-semibold text-stone-100">{s.count}</span>
          </li>
        ))}
        {!stats.sourceSplit.length && (
          <li className="text-xs text-stone-500">Sem leads registrados.</li>
        )}
      </ul>
    </section>
  );
}
