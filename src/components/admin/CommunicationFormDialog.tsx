"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Plus, Loader2, X } from "lucide-react";
import {
  COMMUNICATION_TYPES,
  COMMUNICATION_DIRECTIONS,
  COMM_TYPE_META,
  type CommTypeEnum,
  type CommDirectionEnum,
} from "@/lib/schemas/admin.schema";
import { createCommunicationAction } from "@/lib/actions/admin.actions";
import type { CustomerT, LeadT } from "@/lib/db/store";

const sw = { strokeWidth: 1.5 } as const;

const inp =
  "h-11 w-full rounded-lg border border-stone-800 bg-stone-900 px-3.5 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors";
const lbl = "text-xs font-medium text-stone-400 mb-1.5 block";

export default function CommunicationFormDialog({
  customers,
  leads,
}: {
  customers: CustomerT[];
  leads: LeadT[];
}) {
  const [open, setOpen] = useState(false);
  const [saving, start] = useTransition();

  const [type, setType] = useState<CommTypeEnum>("WHATSAPP");
  const [direction, setDirection] = useState<CommDirectionEnum>("ENVIADA");
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [customerId, setCustomerId] = useState<string>("");
  const [leadId, setLeadId] = useState<string>("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchLead, setSearchLead] = useState("");

  const filteredCustomers = customers.filter((c) => {
    if (!searchCustomer) return true;
    const q = searchCustomer.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const filteredLeads = leads.filter((l) => {
    if (!searchLead) return true;
    const q = searchLead.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.email.toLowerCase().includes(q)
    );
  });

  const reset = () => {
    setType("WHATSAPP");
    setDirection("ENVIADA");
    setSubject("");
    setNotes("");
    setCustomerId("");
    setLeadId("");
    setSearchCustomer("");
    setSearchLead("");
  };

  const handleCreate = () => {
    if (!subject.trim()) return toast.error("Assunto obrigatório");
    start(async () => {
      try {
        await createCommunicationAction({
          type,
          direction,
          subject: subject.trim(),
          notes: notes.trim(),
          customerId: customerId || null,
          leadId: leadId || null,
        });
        toast.success("Interação registrada");
        setOpen(false);
        reset();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao salvar");
      }
    });
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <Dialog.Trigger asChild>
        <button className="h-11 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-semibold transition-all duration-150 active:scale-[0.98] inline-flex items-center gap-1.5">
          <Plus {...sw} className="w-4 h-4" /> Nova Interação
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-2rem)] max-w-md max-h-[85vh] overflow-y-auto rounded-xl border border-stone-800 bg-stone-900 p-5 shadow-2xl focus:outline-none">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-sm font-semibold">
              Nova Interação
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="h-8 w-8 grid place-items-center rounded-lg text-stone-400 hover:text-stone-200 transition-colors">
                <X {...sw} className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl} htmlFor="cf-type">
                  Tipo
                </label>
                <select
                  id="cf-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as CommTypeEnum)}
                  className={inp}
                >
                  {COMMUNICATION_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-stone-900">
                      {COMM_TYPE_META[t].label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={lbl} htmlFor="cf-dir">
                  Direção
                </label>
                <select
                  id="cf-dir"
                  value={direction}
                  onChange={(e) =>
                    setDirection(e.target.value as CommDirectionEnum)
                  }
                  className={inp}
                >
                  {COMMUNICATION_DIRECTIONS.map((d) => (
                    <option key={d} value={d} className="bg-stone-900">
                      {d === "ENVIADA" ? "Enviada" : "Recebida"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={lbl} htmlFor="cf-subject">
                Assunto
              </label>
              <input
                id="cf-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ex: Follow-up proposta"
                className={inp}
                maxLength={100}
              />
            </div>

            <div>
              <label className={lbl} htmlFor="cf-notes">
                Observações
              </label>
              <textarea
                id="cf-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Detalhes da interação..."
                className={`${inp} h-20 py-2.5 resize-none`}
                maxLength={1000}
              />
            </div>

            <div>
              <label className={lbl}>Vincular cliente (opcional)</label>
              <input
                value={searchCustomer}
                onChange={(e) => {
                  setSearchCustomer(e.target.value);
                  if (!e.target.value) setCustomerId("");
                }}
                placeholder="Buscar por nome, telefone ou e-mail..."
                className={inp}
              />
              {searchCustomer && !customerId && (
                <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-stone-800 bg-stone-900 divide-y divide-stone-800/70">
                  {filteredCustomers.slice(0, 5).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setCustomerId(c.id);
                        setSearchCustomer(c.name);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:bg-stone-800/50 transition-colors"
                    >
                      {c.name}{" "}
                      <span className="text-stone-600">{c.phone}</span>
                    </button>
                  ))}
                  {!filteredCustomers.length && (
                    <p className="px-3 py-2 text-xs text-stone-600">
                      Nenhum cliente encontrado
                    </p>
                  )}
                </div>
              )}
              {customerId && (
                <p className="mt-1 text-[10px] text-amber-400">
                  Cliente vinculado.{" "}
                  <button
                    onClick={() => {
                      setCustomerId("");
                      setSearchCustomer("");
                    }}
                    className="underline"
                  >
                    Remover
                  </button>
                </p>
              )}
            </div>

            <div>
              <label className={lbl}>Vincular lead (opcional)</label>
              <input
                value={searchLead}
                onChange={(e) => {
                  setSearchLead(e.target.value);
                  if (!e.target.value) setLeadId("");
                }}
                placeholder="Buscar por nome, telefone ou e-mail..."
                className={inp}
              />
              {searchLead && !leadId && (
                <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-stone-800 bg-stone-900 divide-y divide-stone-800/70">
                  {filteredLeads.slice(0, 5).map((l) => (
                    <button
                      key={l.id}
                      onClick={() => {
                        setLeadId(l.id);
                        setSearchLead(l.name);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:bg-stone-800/50 transition-colors"
                    >
                      {l.name}{" "}
                      <span className="text-stone-600">{l.phone}</span>
                    </button>
                  ))}
                  {!filteredLeads.length && (
                    <p className="px-3 py-2 text-xs text-stone-600">
                      Nenhum lead encontrado
                    </p>
                  )}
                </div>
              )}
              {leadId && (
                <p className="mt-1 text-[10px] text-amber-400">
                  Lead vinculado.{" "}
                  <button
                    onClick={() => {
                      setLeadId("");
                      setSearchLead("");
                    }}
                    className="underline"
                  >
                    Remover
                  </button>
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Dialog.Close asChild>
              <button className="h-11 flex-1 rounded-lg border border-stone-700 text-xs font-semibold text-stone-300 hover:text-stone-100 transition-colors active:scale-[0.98]">
                Cancelar
              </button>
            </Dialog.Close>
            <button
              disabled={!subject.trim() || saving}
              onClick={handleCreate}
              className="h-11 flex-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              {saving ? (
                <Loader2 {...sw} className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus {...sw} className="w-3.5 h-3.5" />
              )}
              Salvar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
