"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  X, Trash2, Loader2, ChevronDown, Link as LinkIcon, UserPlus,
  MessageCircle, Phone, Mail, Store, Instagram, Send, Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  LEAD_STAGES, LEAD_STAGE_META, COMM_TYPE_META,
  type LeadStageEnum, type CommTypeEnum, type CommDirectionEnum,
  type CommunicationInput,
} from "@/lib/schemas/admin.schema";
import {
  updateLeadAction, moveLeadAction, deleteLeadAction,
  linkLeadToCustomerAction, createCommunicationAction,
} from "@/lib/actions/admin.actions";
import { brl, fmtDateTime } from "@/lib/admin/format";
import type { LeadT, CustomerT, CommunicationT } from "@/lib/db/store";
import { getCommunicationsByLeadSync } from "@/lib/db/store";

const sw = { strokeWidth: 1.5 } as const;

const commIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageCircle, Phone, Mail, Store, Instagram,
};

export default function LeadDetailDialog({
  lead,
  customers,
  onClose,
}: {
  lead: LeadT;
  customers: CustomerT[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    source: lead.source,
    value: lead.value,
    notes: lead.notes,
  });

  const [comms, setComms] = useState<CommunicationT[]>(() => getCommunicationsByLeadSync(lead.id));
  const [commForm, setCommForm] = useState<CommunicationInput>({
    leadId: lead.id,
    type: "WHATSAPP",
    direction: "ENVIADA",
    subject: "",
    notes: "",
  });

  const linkedCustomer = lead.customerId ? customers.find((c) => c.id === lead.customerId) : null;

  const handleUpdate = () =>
    start(async () => {
      try {
        await updateLeadAction(lead.id, {
          customerId: lead.customerId,
          stage: lead.stage,
          ...form,
        });
        toast.success("Lead atualizado!");
        setEditing(false);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao atualizar");
      }
    });

  const handleStageChange = (stage: LeadStageEnum) =>
    start(async () => {
      try {
        await moveLeadAction(lead.id, stage);
        toast.success(`Lead → ${LEAD_STAGE_META[stage].label}`);
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao mover");
      }
    });

  const handleDelete = () =>
    start(async () => {
      try {
        await deleteLeadAction(lead.id);
        toast.success("Lead removido!");
        onClose();
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao excluir");
      }
    });

  const handleLinkCustomer = (customerId: string | null) =>
    start(async () => {
      try {
        await linkLeadToCustomerAction(lead.id, customerId);
        toast.success(customerId ? "Lead vinculado ao cliente!" : "Vínculo removido!");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao vincular");
      }
    });

  const handleAddComm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commForm.subject.trim()) return toast.error("Assunto obrigatório");
    start(async () => {
      try {
        await createCommunicationAction(commForm);
        toast.success("Comunicação registrada!");
        setComms((prev) => [
          { id: `tmp-${Date.now()}`, customerId: commForm.customerId ?? null, leadId: commForm.leadId ?? null, orderId: commForm.orderId ?? null, type: commForm.type, direction: commForm.direction, subject: commForm.subject, notes: commForm.notes ?? "", createdAt: new Date().toISOString() },
          ...prev,
        ]);
        setCommForm((f) => ({ ...f, subject: "", notes: "" }));
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao registrar");
      }
    });
  };

  const inp =
    "h-10 w-full rounded-lg border border-stone-800 bg-stone-900 px-3 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors";
  const lbl = "text-[11px] font-medium text-stone-400 mb-1 block";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[5vh] px-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-stone-800 bg-stone-900 shadow-2xl mb-8">
        {/* header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800">
          <div>
            <h2 className="text-sm font-bold">{lead.name}</h2>
            <p className="text-[11px] text-stone-500">{LEAD_STAGE_META[lead.stage].label}</p>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors">
            <X {...sw} className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* stage selector */}
          <div>
            <label className={lbl}>Estágio atual</label>
            <div className="relative">
              <select
                value={lead.stage}
                onChange={(e) => handleStageChange(e.target.value as LeadStageEnum)}
                className={`${inp} appearance-none cursor-pointer pr-8`}
              >
                {LEAD_STAGES.map((s) => (
                  <option key={s} value={s} className="bg-stone-900">
                    {LEAD_STAGE_META[s].label}
                  </option>
                ))}
              </select>
              <ChevronDown {...sw} className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
            </div>
          </div>

          {/* linked customer */}
          <div className="rounded-lg border border-stone-800 bg-stone-950/60 p-3">
            <p className={lbl}>Cliente vinculado</p>
            {linkedCustomer ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LinkIcon {...sw} className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm text-stone-200">{linkedCustomer.name}</span>
                </div>
                <button
                  onClick={() => handleLinkCustomer(null)}
                  className="text-[10px] text-stone-500 hover:text-rose-400 transition-colors"
                >
                  Desvincular
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UserPlus {...sw} className="w-3.5 h-3.5 text-stone-600" />
                <select
                  onChange={(e) => e.target.value && handleLinkCustomer(e.target.value)}
                  className="h-8 flex-1 rounded border border-stone-800 bg-stone-900 px-2 text-[11px] text-stone-400 outline-none"
                  defaultValue=""
                >
                  <option value="" disabled>Selecionar cliente...</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* info / edit form */}
          <div className="rounded-lg border border-stone-800 bg-stone-950/60 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className={lbl}>Informações</p>
              <button
                onClick={() => setEditing(!editing)}
                className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors"
              >
                {editing ? "Cancelar" : "Editar"}
              </button>
            </div>
            {editing ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={lbl}>Nome</label>
                    <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Telefone</label>
                    <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inp} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={lbl}>E-mail</label>
                    <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>Fonte</label>
                    <input value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} className={inp} />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Valor (R$)</label>
                  <input type="number" step="0.10" min="0" value={form.value}
                    onChange={(e) => setForm((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                    className={`${inp} tabular-nums`} />
                </div>
                <div>
                  <label className={lbl}>Notas</label>
                  <textarea rows={2} value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors resize-none" />
                </div>
                <button
                  onClick={handleUpdate}
                  disabled={pending}
                  className="h-9 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-60 inline-flex items-center gap-1.5"
                >
                  {pending && <Loader2 {...sw} className="w-3.5 h-3.5 animate-spin" />}
                  Salvar
                </button>
              </>
            ) : (
              <div className="space-y-1.5 text-sm">
                <InfoRow label="Telefone" value={lead.phone} />
                {lead.email && <InfoRow label="E-mail" value={lead.email} />}
                <InfoRow label="Fonte" value={lead.source} />
                <InfoRow label="Valor" value={brl(lead.value)} highlight />
                {lead.notes && <InfoRow label="Notas" value={lead.notes} />}
                <InfoRow label="Criado" value={fmtDateTime(lead.createdAt)} />
              </div>
            )}
          </div>

          {/* communication history */}
          <div>
            <p className={lbl}>Histórico de comunicações ({comms.length})</p>
            <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
              {comms.length === 0 && (
                <p className="text-[11px] text-stone-600 py-3 text-center">Nenhuma interação registrada</p>
              )}
              {comms.map((c) => {
                const meta = COMM_TYPE_META[c.type];
                const Icon = commIcons[meta?.icon] ?? MessageCircle;
                return (
                  <div key={c.id} className="flex gap-2 rounded-lg border border-stone-800 bg-stone-950/40 p-2.5">
                    <div className="h-7 w-7 rounded-md bg-stone-800 grid place-items-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-stone-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-semibold text-stone-300">{c.subject}</span>
                        <span className="text-[9px] text-stone-600">{c.direction === "ENVIADA" ? "Enviada" : "Recebida"}</span>
                      </div>
                      {c.notes && <p className="text-[11px] text-stone-500 truncate">{c.notes}</p>}
                      <p className="text-[9px] text-stone-600 mt-0.5 flex items-center gap-1">
                        <Clock {...sw} className="w-2.5 h-2.5" /> {fmtDateTime(c.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* add communication */}
            <form onSubmit={handleAddComm} className="rounded-lg border border-stone-800 bg-stone-950/60 p-3 space-y-2">
              <p className="text-[11px] font-semibold text-stone-300 mb-1">Nova interação</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={lbl}>Tipo</label>
                  <select
                    value={commForm.type}
                    onChange={(e) => setCommForm((f) => ({ ...f, type: e.target.value as CommTypeEnum }))}
                    className={inp}
                  >
                    {Object.entries(COMM_TYPE_META).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Direção</label>
                  <select
                    value={commForm.direction}
                    onChange={(e) => setCommForm((f) => ({ ...f, direction: e.target.value as CommDirectionEnum }))}
                    className={inp}
                  >
                    <option value="ENVIADA">Enviada</option>
                    <option value="RECEBIDA">Recebida</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={lbl}>Assunto</label>
                <input
                  value={commForm.subject}
                  onChange={(e) => setCommForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="Ex: Follow-up proposta"
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl}>Notas</label>
                <textarea
                  rows={2}
                  value={commForm.notes}
                  onChange={(e) => setCommForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Detalhes da interação..."
                  className="w-full rounded-lg border border-stone-800 bg-stone-900 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="h-9 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold transition-all active:scale-[0.98] disabled:opacity-60 inline-flex items-center gap-1.5"
              >
                {pending && <Loader2 {...sw} className="w-3.5 h-3.5 animate-spin" />}
                <Send {...sw} className="w-3.5 h-3.5" /> Registrar
              </button>
            </form>
          </div>

          {/* delete */}
          <button
            onClick={handleDelete}
            disabled={pending}
            className="w-full h-10 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold hover:bg-rose-500/15 transition-colors inline-flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-60"
          >
            <Trash2 {...sw} className="w-3.5 h-3.5" /> Excluir Lead
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[11px] text-stone-500">{label}</span>
      <span className={`text-[11px] text-right ${highlight ? "font-bold text-amber-400" : "text-stone-300"}`}>{value}</span>
    </div>
  );
}
