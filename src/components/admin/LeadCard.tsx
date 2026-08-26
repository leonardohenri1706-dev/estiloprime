"use client";

import { useTransition } from "react";
import { ArrowRight, Clock, Globe } from "lucide-react";
import { LEAD_STAGE_META, type LeadStageEnum } from "@/lib/schemas/admin.schema";
import { brl } from "@/lib/admin/format";
import type { LeadT } from "@/lib/db/store";
import { moveLeadAction } from "@/lib/actions/admin.actions";
import { toast } from "sonner";

const sw = { strokeWidth: 1.5 } as const;

const STAGE_ORDER: LeadStageEnum[] = [
  "LEAD", "CONTATO", "PROPOSTA", "NEGOCIACAO", "FECHADO_GANHO", "FECHADO_PERDIDO",
];

function timeSince(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 864e5);
  if (days === 0) return "hoje";
  if (days === 1) return "1 dia";
  if (days < 30) return `${days} dias`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 mês" : `${months} meses`;
}

const sourceColors: Record<string, string> = {
  WhatsApp: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  Instagram: "bg-pink-500/10 text-pink-400 border-pink-500/30",
  Indicação: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  Balcão: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  Site: "bg-violet-500/10 text-violet-400 border-violet-500/30",
};

export default function LeadCard({
  lead,
  onOpen,
}: {
  lead: LeadT;
  onOpen: (lead: LeadT) => void;
}) {
  const [pending, start] = useTransition();
  const meta = LEAD_STAGE_META[lead.stage];
  const stageIdx = STAGE_ORDER.indexOf(lead.stage);
  const canAdvance = stageIdx < STAGE_ORDER.length - 1 && !lead.stage.startsWith("FECHADO");
  const nextStage = canAdvance ? STAGE_ORDER[stageIdx + 1] : null;

  const borderColor: Record<string, string> = {
    LEAD: "border-l-stone-400",
    CONTATO: "border-l-sky-400",
    PROPOSTA: "border-l-amber-400",
    NEGOCIACAO: "border-l-violet-400",
    FECHADO_GANHO: "border-l-emerald-400",
    FECHADO_PERDIDO: "border-l-rose-400",
  };

  const advance = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!nextStage) return;
    start(async () => {
      try {
        await moveLeadAction(lead.id, nextStage);
        toast.success(`Lead → ${LEAD_STAGE_META[nextStage].label}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao mover lead");
      }
    });
  };

  return (
    <button
      onClick={() => onOpen(lead)}
      disabled={pending}
      className={`w-full text-left rounded-lg border border-stone-800 bg-stone-950/60 p-3 hover:bg-stone-800/40 hover:border-stone-700 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer border-l-[3px] ${borderColor[lead.stage]}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-stone-100 truncate">{lead.name}</p>
        {canAdvance && (
          <span
            onClick={advance}
            title={`Mover para ${LEAD_STAGE_META[nextStage!].label}`}
            className="shrink-0 h-6 w-6 grid place-items-center rounded-md text-stone-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
          >
            <ArrowRight {...sw} className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

      <p className="text-xs font-bold tabular-nums text-amber-400 mb-2">{brl(lead.value)}</p>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${sourceColors[lead.source] ?? "bg-stone-500/10 text-stone-400 border-stone-500/30"}`}>
          <Globe {...sw} className="w-2.5 h-2.5" />
          {lead.source}
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] text-stone-500">
          <Clock {...sw} className="w-2.5 h-2.5" />
          {timeSince(lead.createdAt)}
        </span>
      </div>
    </button>
  );
}
