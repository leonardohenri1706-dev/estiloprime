"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  LEAD_STAGES, LEAD_STAGE_META, type LeadStageEnum, type LeadInput,
} from "@/lib/schemas/admin.schema";
import { createLeadAction } from "@/lib/actions/admin.actions";

const sw = { strokeWidth: 1.5 } as const;

const SOURCES = ["WhatsApp", "Instagram", "Indicação", "Balcão", "Site"] as const;

export default function LeadFormDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [form, setForm] = useState<LeadInput>({
    name: "",
    phone: "",
    email: "",
    source: "WhatsApp",
    stage: "LEAD",
    value: 0,
    notes: "",
  });

  const set = <K extends keyof LeadInput>(key: K, val: LeadInput[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Nome obrigatório");
    if (!form.phone.trim()) return toast.error("Telefone obrigatório");
    start(async () => {
      try {
        await createLeadAction(form);
        toast.success("Lead criado com sucesso!");
        onClose();
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao criar lead");
      }
    });
  };

  const inp =
    "h-10 w-full rounded-lg border border-stone-800 bg-stone-900 px-3 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors";
  const lbl = "text-[11px] font-medium text-stone-400 mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-stone-800 bg-stone-900 shadow-2xl">
        {/* header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 grid place-items-center">
              <UserPlus {...sw} className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-sm font-bold">Novo Lead</h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors">
            <X {...sw} className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Nome *</label>
              <input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Nome do lead"
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Telefone *</label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="88999999999"
                className={inp}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@exemplo.com"
                className={inp}
              />
            </div>
            <div>
              <label className={lbl}>Fonte</label>
              <select
                value={form.source}
                onChange={(e) => set("source", e.target.value)}
                className={inp}
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={lbl}>Estágio</label>
              <select
                value={form.stage}
                onChange={(e) => set("stage", e.target.value as LeadStageEnum)}
                className={inp}
              >
                {LEAD_STAGES.map((s) => (
                  <option key={s} value={s}>{LEAD_STAGE_META[s].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={lbl}>Valor (R$)</label>
              <input
                type="number"
                step="0.10"
                min="0"
                value={form.value || ""}
                onChange={(e) => set("value", parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={`${inp} tabular-nums`}
              />
            </div>
          </div>

          <div>
            <label className={lbl}>Notas</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Observações sobre o lead..."
              className="w-full rounded-lg border border-stone-800 bg-stone-900 px-3 py-2.5 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors resize-none"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-10 flex-1 rounded-lg border border-stone-800 text-stone-400 text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-10 flex-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              {pending && <Loader2 {...sw} className="w-3.5 h-3.5 animate-spin" />}
              Criar Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
