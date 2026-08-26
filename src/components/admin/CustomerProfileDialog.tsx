"use client";

import { useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Phone, Mail, MapPin, ShoppingCart, DollarSign, Calendar, Pencil, StickyNote } from "lucide-react";
import type { CustomerT } from "@/lib/db/store";
import { brl, fmtDateTime } from "@/lib/admin/format";
import CustomerFormDialog from "./CustomerFormDialog";

const sw = { strokeWidth: 1.5 } as const;

export default function CustomerProfileDialog({
  children,
  customer,
}: {
  children: ReactNode;
  customer: CustomerT;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-stone-800 bg-stone-900 p-5 sm:p-6 shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-sm font-semibold">Perfil do Cliente</Dialog.Title>
            <Dialog.Close asChild>
              <button className="h-8 w-8 grid place-items-center rounded-lg text-stone-500 hover:text-stone-300 hover:bg-stone-800 transition-colors">
                <X {...sw} className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-base font-semibold text-stone-100 truncate">{customer.name}</p>
                <div className="mt-1 space-y-0.5">
                  <a
                    href={`tel:+55${customer.phone}`}
                    className="flex items-center gap-2 text-xs text-stone-400 hover:text-amber-400 transition-colors tabular-nums"
                  >
                    <Phone {...sw} className="w-3.5 h-3.5 shrink-0" />
                    {customer.phone}
                  </a>
                  {customer.email && (
                    <a
                      href={`mailto:${customer.email}`}
                      className="flex items-center gap-2 text-xs text-stone-400 hover:text-amber-400 transition-colors truncate"
                    >
                      <Mail {...sw} className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{customer.email}</span>
                    </a>
                  )}
                  {customer.city && (
                    <span className="flex items-center gap-2 text-xs text-stone-400">
                      <MapPin {...sw} className="w-3.5 h-3.5 shrink-0" />
                      {customer.city}
                    </span>
                  )}
                </div>
              </div>
              <CustomerFormDialog customer={customer}>
                <button
                  className="h-9 px-3 rounded-lg border border-stone-800 text-stone-400 text-xs font-medium hover:text-amber-400 hover:border-amber-500/40 transition-colors active:scale-[0.98] inline-flex items-center gap-1.5 shrink-0"
                >
                  <Pencil {...sw} className="w-3.5 h-3.5" />
                  Editar
                </button>
              </CustomerFormDialog>
            </div>

            {/* Tags */}
            {customer.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {customer.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-stone-800 bg-stone-950/60 p-3 text-center">
                <ShoppingCart {...sw} className="w-4 h-4 text-stone-600 mx-auto mb-1.5" />
                <p className="text-lg font-bold text-stone-100 tabular-nums">{customer.totalOrders}</p>
                <p className="text-[10px] text-stone-500 uppercase tracking-wider">Pedidos</p>
              </div>
              <div className="rounded-lg border border-stone-800 bg-stone-950/60 p-3 text-center">
                <DollarSign {...sw} className="w-4 h-4 text-stone-600 mx-auto mb-1.5" />
                <p className="text-lg font-bold text-stone-100 tabular-nums">{brl(customer.totalSpent)}</p>
                <p className="text-[10px] text-stone-500 uppercase tracking-wider">Total Gasto</p>
              </div>
              <div className="rounded-lg border border-stone-800 bg-stone-950/60 p-3 text-center">
                <Calendar {...sw} className="w-4 h-4 text-stone-600 mx-auto mb-1.5" />
                <p className="text-sm font-bold text-stone-100 tabular-nums">
                  {customer.lastOrderAt ? fmtDateTime(customer.lastOrderAt) : "—"}
                </p>
                <p className="text-[10px] text-stone-500 uppercase tracking-wider">Último Pedido</p>
              </div>
            </div>

            {/* Notes */}
            {customer.notes && (
              <div className="rounded-lg border border-stone-800 bg-stone-950/60 p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <StickyNote {...sw} className="w-3.5 h-3.5 text-stone-600" />
                  <p className="text-[10px] font-medium text-stone-500 uppercase tracking-wider">Observações</p>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">{customer.notes}</p>
              </div>
            )}

            {/* Meta */}
            <p className="text-[10px] text-stone-600">
              Cliente desde {fmtDateTime(customer.createdAt)}
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
