import { notFound } from "next/navigation";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { getOrderPublic } from "@/lib/db/store";
import { brl, fmtDateTime, waLink } from "@/lib/admin/format";
import { ORDER_STATUS_META, type OrderStatusEnum } from "@/lib/schemas/admin.schema";

export const dynamic = "force-dynamic";

const sw = { strokeWidth: 1.5 } as const;

export default async function PedidoPublicoPage({
  params,
}: {
  params: { orderNumber: string };
}) {
  const order = await getOrderPublic(params.orderNumber);
  if (!order) notFound();

  const status = order.status as OrderStatusEnum;
  const meta = ORDER_STATUS_META[status];

  const StatusIcon =
    status === "DELIVERED" ? CheckCircle2 : status === "CANCELLED" ? XCircle : Clock;

  return (
    <main className="min-h-screen bg-stone-950 text-stone-100 px-4 py-12">
      <div className="max-w-md mx-auto">
        <header className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-lg border border-amber-500/30 bg-amber-500/10 grid place-items-center mb-4">
            <span className="text-amber-400 font-bold text-sm tracking-wider">EP</span>
          </div>
          <p className="mono text-[10px] uppercase tracking-[0.25em] text-stone-500">Comanda digital</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight tabular-nums">#{order.orderNumber}</h1>
          <p className="text-[11px] text-stone-600 mt-1 tabular-nums">{fmtDateTime(order.createdAt)}</p>
          <span
            className={`inline-flex items-center gap-1.5 mt-4 px-3 py-1.5 rounded-full border text-[11px] font-semibold uppercase tracking-wide ${meta.chip}`}
          >
            <StatusIcon {...sw} className="w-3.5 h-3.5" />
            {meta.label}
          </span>
        </header>

        <section className="rounded-xl border border-stone-800 bg-stone-900/60 divide-y divide-stone-800/70">
          {order.items.map((it, i) => (
            <div key={i} className="flex items-center justify-between gap-3 p-4 min-h-11">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{it.productName}</p>
                <p className="text-[11px] text-stone-500 tabular-nums">
                  Tam {it.size} · {it.quantity}x · {brl(it.price)}
                </p>
              </div>
              <span className="tabular-nums font-semibold text-sm">{brl(it.price * it.quantity)}</span>
            </div>
          ))}
          <div className="p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-stone-400 text-xs">
              <span>Entrega · {order.deliveryType}</span>
              <span className="tabular-nums">{order.deliveryFee === 0 ? "GRÁTIS" : brl(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-stone-800">
              <span className="text-xs uppercase tracking-widest text-stone-500">Total</span>
              <span className="text-xl font-bold tabular-nums text-amber-400">{brl(order.totalAmount)}</span>
            </div>
          </div>
        </section>

        <a
          href={waLink("5588999999999", `Olá! Sobre minha comanda #${order.orderNumber}:`)}
          target="_blank" rel="noopener noreferrer"
          className="mt-6 h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98]"
        >
          Falar com a loja no WhatsApp
        </a>

        <p className="mt-6 text-center text-[10px] text-stone-700">
          Estilo Prime Store · Moda Masculina &amp; Streetwear · Itaiçaba — CE
        </p>
      </div>
    </main>
  );
}
