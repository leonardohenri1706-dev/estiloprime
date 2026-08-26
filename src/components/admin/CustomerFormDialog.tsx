"use client";

import { useState, useTransition, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Plus, X, Loader2, Pencil } from "lucide-react";
import type { CustomerT } from "@/lib/db/store";
import {
  createCustomerAction,
  updateCustomerAction,
} from "@/lib/actions/admin.actions";

const sw = { strokeWidth: 1.5 } as const;

type FormState = {
  name: string;
  phone: string;
  email: string;
  cpf: string;
  address: string;
  city: string;
  notes: string;
  tags: string;
};

const EMPTY: FormState = {
  name: "",
  phone: "",
  email: "",
  cpf: "",
  address: "",
  city: "",
  notes: "",
  tags: "",
};

const inp =
  "h-11 w-full rounded-lg border border-stone-800 bg-stone-900 px-3.5 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors";
const lbl = "text-xs font-medium text-stone-400 mb-1.5 block";

export default function CustomerFormDialog({
  children,
  customer,
}: {
  children?: ReactNode;
  customer?: CustomerT;
}) {
  const [open, setOpen] = useState(false);
  const [saving, start] = useTransition();
  const [form, setForm] = useState<FormState>(() =>
    customer
      ? {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          cpf: customer.cpf,
          address: customer.address,
          city: customer.city,
          notes: customer.notes,
          tags: customer.tags.join(", "),
        }
      : EMPTY
  );

  const set = (key: keyof FormState, val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    start(async () => {
      try {
        if (customer) {
          await updateCustomerAction(customer.id, { ...form, tags });
          toast.success("Cliente atualizado!");
        } else {
          await createCustomerAction({ ...form, tags });
          toast.success("Cliente criado!");
        }
        setOpen(false);
        setForm(EMPTY);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erro ao salvar");
      }
    });
  };

  const trigger = children ?? (
    <button className="h-11 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-semibold transition-all duration-150 active:scale-[0.98] inline-flex items-center gap-2">
      <Plus {...sw} className="w-4 h-4" />
      Novo cliente
    </button>
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o && customer) {
          setForm({
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            cpf: customer.cpf,
            address: customer.address,
            city: customer.city,
            notes: customer.notes,
            tags: customer.tags.join(", "),
          });
        }
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-stone-800 bg-stone-900 p-5 sm:p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-sm font-semibold">
              {customer ? "Editar cliente" : "Novo cliente"}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="h-8 w-8 grid place-items-center rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-colors">
                <X {...sw} className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={lbl} htmlFor="c-name">
                  Nome *
                </label>
                <input
                  id="c-name"
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Nome do cliente"
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl} htmlFor="c-phone">
                  Telefone *
                </label>
                <input
                  id="c-phone"
                  required
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="88999999999"
                  className={`${inp} tabular-nums`}
                />
              </div>
              <div>
                <label className={lbl} htmlFor="c-email">
                  E-mail
                </label>
                <input
                  id="c-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="cliente@email.com"
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl} htmlFor="c-cpf">
                  CPF
                </label>
                <input
                  id="c-cpf"
                  value={form.cpf}
                  onChange={(e) => set("cpf", e.target.value)}
                  placeholder="000.111.222-33"
                  className={inp}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl} htmlFor="c-address">
                  Endereço
                </label>
                <input
                  id="c-address"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Rua, número, bairro"
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl} htmlFor="c-city">
                  Cidade
                </label>
                <input
                  id="c-city"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Ex: Itaiçaba"
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl} htmlFor="c-tags">
                  Tags (separar com vírgula)
                </label>
                <input
                  id="c-tags"
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="VIP, Fiel, Atacado"
                  className={inp}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl} htmlFor="c-notes">
                  Observações
                </label>
                <textarea
                  id="c-notes"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Preferências, histórico, observações..."
                  className="w-full rounded-lg border border-stone-800 bg-stone-900 px-3.5 py-3 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="h-11 px-4 rounded-lg border border-stone-800 text-stone-400 text-sm font-medium hover:bg-stone-800 transition-colors active:scale-[0.98]"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={saving}
                className="h-11 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 text-sm font-semibold transition-all duration-150 active:scale-[0.98] inline-flex items-center gap-2"
              >
                {saving && <Loader2 {...sw} className="w-4 h-4 animate-spin" />}
                {customer ? "Salvar" : "Criar cliente"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
