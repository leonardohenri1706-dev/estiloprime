"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { Clock3, PackageX, PauseCircle, Eraser } from "lucide-react";
import { fmtDateTime } from "@/lib/admin/format";
import {
  zerarGradeAction, toggleProductActiveAction,
} from "@/lib/actions/admin.actions";

const sw = { strokeWidth: 1.5 } as const;

type Pending = { id: string; orderNumber: string; customerName: string; totalAmount: number; createdAt: string; customerPhone: string };
type Rupture = { id: string; name: string; minStock: number };

export function PendingOrdersCard({ orders }: { orders: Pending[] }) {
  return (
    <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 sm:p-5">
      <header className="flex items-center gap-2 mb-4">
        <Clock3 {...sw} className="w-4 h-4 text-amber-400" />
        <h2 className="text-sm font-semibold tracking-tight">Aguardando separação</h2>
        {orders.length > 0 && (
          <span className="relative ml-auto flex w-2.5 h-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
          </span>
        )}
      </header>

      {!orders.length ? (
        <p className="text-xs text-stone-500 py-6 text-center">Nenhuma comanda pendente 🎉</p>
      ) : (
        <ul className="divide-y divide-stone-800/70">
          {orders.slice(0, 5).map((o) => (
            <li key={o.id} className="py-2.5 flex items-center gap-3 min-h-11">
              <span className="text-xs font-bold text-amber-400 tabular-nums shrink-0">#{o.orderNumber}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{o.customerName}</p>
                <p className="text-[10px] text-stone-500 tabular-nums">{fmtDateTime(o.createdAt)}</p>
              </div>
              <span className="text-xs font-semibold tabular-nums">
                {o.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/admin/pedidos"
        className="mt-3 h-11 flex items-center justify-center rounded-lg border border-stone-700 hover:border-amber-500/40 text-xs font-semibold text-stone-300 hover:text-amber-400 transition-colors duration-150 active:scale-[0.98]"
      >
        Abrir comandas
      </Link>
    </section>
  );
}

export function RupturesCard({ items }: { items: Rupture[] }) {
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<unknown>, ok: string) =>
    start(async () => {
      try {
        await fn();
        toast.success(ok);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Falha na operação");
      }
    });

  return (
    <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 sm:p-5">
      <header className="flex items-center gap-2 mb-1">
        <PackageX {...sw} className="w-4 h-4 text-rose-400" />
        <h2 className="text-sm font-semibold tracking-tight">Ruptura de estoque</h2>
      </header>
      <p className="text-[11px] text-stone-500 mb-4">Variações críticas (&lt; 2 un) em produtos ativos</p>

      {!items.length ? (
        <p className="text-xs text-stone-500 py-6 text-center">Estoque saudável ✅</p>
      ) : (
        <ul className="space-y-2">
          {items.map(({ id, name, minStock }) => (
            <li key={id} className="flex items-center gap-3 min-h-11 rounded-lg border border-stone-800 px-3">
              <span
                className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums border ${
                  minStock === 0
                    ? "text-rose-400 bg-rose-500/10 border-rose-500/30"
                    : "text-amber-400 bg-amber-500/10 border-amber-500/30"
                }`}
              >
                {minStock === 0 ? "ZERADO" : `${minStock} un`}
              </span>
              <p className="min-w-0 flex-1 text-xs font-medium truncate">{name}</p>
              <button
                title="Zerar grade"
                onClick={() => confirm(`Zerar todo o estoque de "${name}"?`) && run(() => zerarGradeAction(id), "Grade zerada")}
                className="h-9 w-9 grid place-items-center rounded-lg text-stone-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors active:scale-[0.98]"
              >
                <Eraser strokeWidth={1.5} className="w-4 h-4" />
              </button>
              <button
                title="Pausar produto"
                disabled={pending}
                onClick={() => run(() => toggleProductActiveAction(id), "Produto pausado")}
                className="h-9 w-9 grid place-items-center rounded-lg text-stone-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors active:scale-[0.98]"
              >
                <PauseCircle strokeWidth={1.5} className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
