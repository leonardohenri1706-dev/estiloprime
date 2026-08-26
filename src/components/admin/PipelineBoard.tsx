"use client";

import { useState, useMemo } from "react";
import {
  Plus, TrendingUp, Target, DollarSign, BarChart3,
} from "lucide-react";
import { LEAD_STAGES, LEAD_STAGE_META, type LeadStageEnum } from "@/lib/schemas/admin.schema";
import { brl, brlCompact } from "@/lib/admin/format";
import type { LeadT, CustomerT, LeadStage } from "@/lib/db/store";
import LeadCard from "./LeadCard";
import LeadDetailDialog from "./LeadDetailDialog";
import LeadFormDialog from "./LeadFormDialog";

const sw = { strokeWidth: 1.5 } as const;

export default function PipelineBoard({
  leads,
  customers,
  byStage,
}: {
  leads: LeadT[];
  customers: CustomerT[];
  byStage: Map<LeadStage, LeadT[]>;
}) {
  const [detailLead, setDetailLead] = useState<LeadT | null>(null);
  const [showForm, setShowForm] = useState(false);

  const stages = LEAD_STAGES;

  const stats = useMemo(() => {
    const active = leads.filter((l) => !l.stage.startsWith("FECHADO"));
    const won = leads.filter((l) => l.stage === "FECHADO_GANHO");
    const lost = leads.filter((l) => l.stage === "FECHADO_PERDIDO");
    const pipelineValue = active.reduce((s, l) => s + l.value, 0);
    const wonValue = won.reduce((s, l) => s + l.value, 0);
    const closedTotal = won.length + lost.length;
    const conversionRate = closedTotal ? Math.round((won.length / closedTotal) * 100) : 0;
    return { pipelineValue, wonValue, conversionRate, totalLeads: leads.length };
  }, [leads]);

  return (
    <div className="space-y-5">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Pipeline de Vendas</h1>
          <p className="text-xs text-stone-500">{stats.totalLeads} leads no sistema</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all active:scale-[0.98]"
        >
          <Plus {...sw} className="w-4 h-4" /> Novo Lead
        </button>
      </div>

      {/* summary bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/30 grid place-items-center">
            <DollarSign {...sw} className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">Valor em Pipeline</p>
            <p className="text-base font-bold tabular-nums text-amber-400">{brl(stats.pipelineValue)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 grid place-items-center">
            <TrendingUp {...sw} className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">Total Ganho</p>
            <p className="text-base font-bold tabular-nums text-emerald-400">{brl(stats.wonValue)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-sky-500/10 border border-sky-500/30 grid place-items-center">
            <Target {...sw} className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">Taxa de Conversão</p>
            <p className="text-base font-bold tabular-nums text-sky-400">{stats.conversionRate}%</p>
          </div>
        </div>
      </div>

      {/* kanban columns */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1 snap-x snap-mandatory">
        {stages.map((stage) => {
          const meta = LEAD_STAGE_META[stage];
          const stageLeads = byStage.get(stage) ?? [];
          const totalValue = stageLeads.reduce((s, l) => s + l.value, 0);

          return (
            <div
              key={stage}
              className={`flex-shrink-0 w-[280px] snap-start rounded-xl border ${meta.border} ${meta.bg} flex flex-col max-h-[calc(100vh-220px)]`}
            >
              {/* column header */}
              <div className="p-3 border-b border-stone-800/50">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>
                    {meta.label}
                  </h3>
                  <span className="text-[10px] font-bold tabular-nums text-stone-500 bg-stone-900/60 px-2 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>
                {totalValue > 0 && (
                  <p className="text-[11px] font-semibold tabular-nums text-stone-500">
                    {brlCompact(totalValue)}
                  </p>
                )}
              </div>

              {/* cards */}
              <div className="p-2 space-y-2 overflow-y-auto flex-1 min-h-0">
                {stageLeads.length === 0 && (
                  <p className="text-center text-[11px] text-stone-600 py-6">Nenhum lead</p>
                )}
                {stageLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onOpen={setDetailLead} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* dialogs */}
      {detailLead && (
        <LeadDetailDialog
          lead={detailLead}
          customers={customers}
          onClose={() => setDetailLead(null)}
        />
      )}
      {showForm && (
        <LeadFormDialog onClose={() => setShowForm(false)} />
      )}
    </div>
  );
}
