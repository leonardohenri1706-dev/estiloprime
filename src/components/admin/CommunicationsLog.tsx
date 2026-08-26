"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  MessageCircle,
  Phone,
  Store,
  Mail,
  Instagram,
  Plus,
  Filter,
  Search,
  Trash2,
  ExternalLink,
  Inbox,
} from "lucide-react";
import type {
  CommunicationT,
  CustomerT,
  LeadT,
  CommType,
  CommDirection,
} from "@/lib/db/store";
import {
  COMMUNICATION_TYPES,
  COMMUNICATION_DIRECTIONS,
  COMM_TYPE_META,
} from "@/lib/schemas/admin.schema";
import { deleteCommunicationAction } from "@/lib/actions/admin.actions";
import { fmtDateTime } from "@/lib/admin/format";
import CommunicationFormDialog from "./CommunicationFormDialog";

const sw = { strokeWidth: 1.5 } as const;

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageCircle,
  Phone,
  Store,
  Mail,
  Instagram,
};

const inp =
  "h-11 w-full rounded-lg border border-stone-800 bg-stone-900 px-3.5 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors";
const lbl = "text-xs font-medium text-stone-400 mb-1.5 block";

const directionMeta: Record<
  CommDirection,
  { label: string; chip: string }
> = {
  ENVIADA: {
    label: "ENVIADA",
    chip:
      "bg-sky-500/10 text-sky-400 border-sky-500/30",
  },
  RECEBIDA: {
    label: "RECEBIDA",
    chip:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
};

const typeColor: Record<CommType, string> = {
  WHATSAPP: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  TELEFONE: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  PRESENCIAL: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  EMAIL: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  INSTAGRAM: "bg-pink-500/10 text-pink-400 border-pink-500/30",
};

export default function CommunicationsLog({
  communications,
  customers,
  leads,
}: {
  communications: CommunicationT[];
  customers: CustomerT[];
  leads: LeadT[];
}) {
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [dirFilter, setDirFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [pending, start] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers],
  );
  const leadMap = useMemo(
    () => new Map(leads.map((l) => [l.id, l])),
    [leads],
  );

  const filtered = useMemo(() => {
    let list = communications;
    if (typeFilter) {
      list = list.filter((c) => c.type === typeFilter);
    }
    if (dirFilter) {
      list = list.filter((c) => c.direction === dirFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.subject.toLowerCase().includes(q) ||
          c.notes.toLowerCase().includes(q),
      );
    }
    return list;
  }, [communications, typeFilter, dirFilter, search]);

  const stats = useMemo(() => {
    const total = communications.length;
    const byType = COMMUNICATION_TYPES.map((t) => ({
      type: t,
      label: COMM_TYPE_META[t].label,
      count: communications.filter((c) => c.type === t).length,
    }));
    return { total, byType };
  }, [communications]);

  const handleDelete = (id: string) => {
    setDeletingId(id);
    start(async () => {
      try {
        await deleteCommunicationAction(id);
        toast.success("Interação removida");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao remover");
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs text-stone-500 tabular-nums">
          {stats.total} interação(ões)
        </p>
        {stats.byType
          .filter((s) => s.count > 0)
          .map((s) => {
            const meta = COMM_TYPE_META[s.type];
            const Icon = TYPE_ICONS[meta.icon];
            return (
              <span
                key={s.type}
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-md border ${typeColor[s.type]}`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                {s.count}
              </span>
            );
          })}
        <div className="ml-auto">
          <CommunicationFormDialog customers={customers} leads={leads} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search
            {...sw}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600 pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por assunto..."
            className={`${inp} pl-9`}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className={`${inp} w-auto min-w-[140px]`}
        >
          <option value="" className="bg-stone-900">
            Todos os tipos
          </option>
          {COMMUNICATION_TYPES.map((t) => (
            <option key={t} value={t} className="bg-stone-900">
              {COMM_TYPE_META[t].label}
            </option>
          ))}
        </select>
        <select
          value={dirFilter}
          onChange={(e) => setDirFilter(e.target.value)}
          className={`${inp} w-auto min-w-[130px]`}
        >
          <option value="" className="bg-stone-900">
            Todas
          </option>
          {COMMUNICATION_DIRECTIONS.map((d) => (
            <option key={d} value={d} className="bg-stone-900">
              {d === "ENVIADA" ? "Enviada" : "Recebida"}
            </option>
          ))}
        </select>
      </div>

      {/* Timeline */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/60 divide-y divide-stone-800/70">
        {filtered.map((c) => {
          const meta = COMM_TYPE_META[c.type];
          const Icon = TYPE_ICONS[meta.icon];
          const dir = directionMeta[c.direction];
          const customer = c.customerId
            ? customerMap.get(c.customerId)
            : null;
          const lead = c.leadId ? leadMap.get(c.leadId) : null;

          return (
            <div
              key={c.id}
              className="flex items-start gap-3 p-4 hover:bg-stone-800/25 transition-colors"
            >
              {/* Type icon */}
              <div
                className={`mt-0.5 h-9 w-9 shrink-0 grid place-items-center rounded-lg border ${typeColor[c.type]}`}
              >
                {Icon && <Icon {...sw} className="w-4 h-4" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center text-[10px] font-semibold px-1.5 py-0.5 rounded border ${dir.chip}`}
                  >
                    {dir.label}
                  </span>
                  <h3 className="text-sm font-medium text-stone-100 truncate">
                    {c.subject}
                  </h3>
                </div>

                {c.notes && (
                  <p className="mt-1 text-xs text-stone-400 line-clamp-2">
                    {c.notes}
                  </p>
                )}

                <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] text-stone-600 tabular-nums">
                    {fmtDateTime(c.createdAt)}
                  </span>

                  {customer && (
                    <a
                      href={`/admin/clientes`}
                      className="inline-flex items-center gap-1 text-[10px] text-amber-400/80 hover:text-amber-400 transition-colors"
                    >
                      <ExternalLink {...sw} className="w-3 h-3" />
                      {customer.name}
                    </a>
                  )}

                  {lead && (
                    <a
                      href={`/admin/pipeline`}
                      className="inline-flex items-center gap-1 text-[10px] text-violet-400/80 hover:text-violet-400 transition-colors"
                    >
                      <ExternalLink {...sw} className="w-3 h-3" />
                      Lead: {lead.name}
                    </a>
                  )}
                </div>
              </div>

              {/* Delete */}
              <button
                disabled={deletingId === c.id}
                onClick={() => handleDelete(c.id)}
                title="Remover interação"
                className="mt-1 h-8 w-8 shrink-0 grid place-items-center rounded-lg text-stone-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors active:scale-[0.98] disabled:opacity-50"
              >
                <Trash2 {...sw} className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {!filtered.length && (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <Inbox {...sw} className="w-10 h-10 text-stone-700" />
            <p className="text-sm text-stone-500">
              {communications.length
                ? "Nenhuma interação encontrada com esses filtros."
                : "Nenhuma interação registrada ainda."}
            </p>
            {communications.length > 0 && (
              <button
                onClick={() => {
                  setTypeFilter("");
                  setDirFilter("");
                  setSearch("");
                }}
                className="text-xs text-amber-400 hover:underline"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
