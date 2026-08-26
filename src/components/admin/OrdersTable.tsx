"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { MessageCircle, Printer, ExternalLink, User, Send } from "lucide-react";
import { brl, fmtDateTime, waLink } from "@/lib/admin/format";
import {
  ORDER_STATUSES, ORDER_STATUS_META,
  type OrderStatusEnum,
} from "@/lib/schemas/admin.schema";
import { updateOrderStatusAction } from "@/lib/actions/admin.actions";

const sw = { strokeWidth: 1.5 } as const;

export interface OrderItem {
  productName: string; size: string; quantity: number; price: number;
}

export interface OrderRow {
  id: string; orderNumber: string; customerName: string; customerPhone: string;
  deliveryType: string; deliveryFee: number; totalAmount: number;
  status: OrderStatusEnum; createdAt: string;
  itemsSummary: string[]; customerId?: string | null;
  items?: OrderItem[];
  paymentMethod?: string;
}

export interface StoreSettings {
  whatsappNumber: string;
  pixKey: string;
  pixKeyType: string;
  pixName: string;
  paymentCashEnabled: boolean;
  paymentPixEnabled: boolean;
  paymentCardEnabled: boolean;
}

function buildWhatsAppText(order: OrderRow, settings: StoreSettings): string {
  const lines: string[] = [];
  lines.push(`*ESTILO PRIME STORE*`);
  lines.push(`Moda Masculina`);
  lines.push("");
  lines.push(`Pedido #${order.orderNumber}`);
  lines.push(`${fmtDateTime(order.createdAt)}`);
  lines.push("");
  lines.push(`--- ITENS ---`);
  if (order.items?.length) {
    order.items.forEach((item) => {
      lines.push(`${item.quantity}x ${item.productName} (${item.size}) — ${brl(item.price * item.quantity)}`);
    });
  } else {
    order.itemsSummary.forEach((s) => lines.push(s));
  }
  lines.push("");
  lines.push(`--- CLIENTE ---`);
  lines.push(`Nome: ${order.customerName}`);
  lines.push(`Tel: ${order.customerPhone}`);
  lines.push(`Entrega: ${order.deliveryType}`);
  if (order.deliveryFee > 0) lines.push(`Frete: ${brl(order.deliveryFee)}`);
  lines.push("");
  lines.push(`*TOTAL: ${brl(order.totalAmount)}*`);
  lines.push("");
  const payMethods: string[] = [];
  if (order.paymentMethod) payMethods.push(order.paymentMethod);
  if (!payMethods.length) {
    if (settings.paymentCashEnabled) payMethods.push("Dinheiro");
    if (settings.paymentPixEnabled) payMethods.push(`Pix (${settings.pixKeyType}: ${settings.pixKey})`);
    if (settings.paymentCardEnabled) payMethods.push("Cartão");
  }
  if (payMethods.length) {
    lines.push(`Forma de pagamento: ${payMethods.join(" / ")}`);
    lines.push("");
  }
  lines.push(`Obrigado pela preferencia!`);
  return lines.join("\n");
}

export default function OrdersTable({
  orders,
  settings,
}: {
  orders: OrderRow[];
  settings: StoreSettings;
}) {
  const [rows, setRows] = useState(orders);
  const [, start] = useTransition();
  const [printing, setPrinting] = useState<OrderRow | null>(null);

  useEffect(() => setRows(orders), [orders]);

  useEffect(() => {
    if (printing) {
      const t = setTimeout(() => window.print(), 80);
      return () => clearTimeout(t);
    }
  }, [printing]);

  const changeStatus = (id: string, status: OrderStatusEnum) => {
    const prev = rows;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
    start(async () => {
      try {
        await updateOrderStatusAction(id, status);
        toast.success(`Status → ${ORDER_STATUS_META[status].label}`);
      } catch (e) {
        setRows(prev);
        toast.error(e instanceof Error ? e.message : "Erro");
      }
    });
  };

  return (
    <>
      {/* tabela */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/60 overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-stone-500 border-b border-stone-800">
              <th className="p-4 font-medium">Comanda</th>
              <th className="p-4 font-medium">Cliente</th>
              <th className="p-4 font-medium">Itens</th>
              <th className="p-4 font-medium">Entrega</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/70">
            {rows.map((o) => {
              const meta = ORDER_STATUS_META[o.status];
              return (
                <tr key={o.id} className="hover:bg-stone-800/25 transition-colors align-top">
                  <td className="p-3.5 min-h-11">
                    <p className="font-bold text-amber-400 tabular-nums">#{o.orderNumber}</p>
                    <p className="text-[10px] text-stone-600 tabular-nums">{fmtDateTime(o.createdAt)}</p>
                  </td>
                  <td className="p-3.5">
                    <p className="font-medium">{o.customerName}</p>
                    <a href={`tel:+55${o.customerPhone}`} className="text-[11px] text-stone-500 hover:text-amber-400 tabular-nums">{o.customerPhone}</a>
                  </td>
                  <td className="p-3.5 max-w-[220px]">
                    {o.itemsSummary.map((s, i) => (
                      <p key={i} className="text-[11px] text-stone-400 truncate">{s}</p>
                    ))}
                  </td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-md border border-stone-700 text-stone-400 whitespace-nowrap">
                      {o.deliveryType}
                    </span>
                  </td>
                  <td className="p-3.5 tabular-nums font-semibold whitespace-nowrap">
                    {brl(o.totalAmount)}
                    {o.deliveryFee > 0 && (
                      <span className="block text-[10px] text-stone-600 font-normal">frete {brl(o.deliveryFee)}</span>
                    )}
                  </td>
                  <td className="p-3.5">
                    <div className={`relative inline-flex items-center gap-1.5 rounded-lg border px-2 ${meta.chip}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${o.status === "PENDING" ? "animate-pulse" : ""}`} />
                      <select
                        value={o.status}
                        onChange={(e) => changeStatus(o.id, e.target.value as OrderStatusEnum)}
                        aria-label={`Status da comanda ${o.orderNumber}`}
                        className="appearance-none bg-transparent text-[11px] font-semibold uppercase tracking-wide outline-none cursor-pointer pr-1 h-9"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-stone-900 text-stone-200">
                            {ORDER_STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {o.customerId && (
                        <a
                          href={`/admin/clientes?highlight=${o.customerId}`}
                          title="Ver perfil do cliente"
                          className="h-9 w-9 grid place-items-center rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 transition-colors active:scale-[0.98]"
                        >
                          <User {...sw} className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => {
                          const text = buildWhatsAppText(o, settings);
                          navigator.clipboard.writeText(text);
                          toast.success("Texto copiado! Cole no WhatsApp.");
                        }}
                        title="Copiar texto do pedido"
                        className="h-9 w-9 grid place-items-center rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 transition-colors active:scale-[0.98]"
                      >
                        <Send {...sw} className="w-4 h-4" />
                      </button>
                      <a
                        href={waLink(o.customerPhone || settings.whatsappNumber, buildWhatsAppText(o, settings))}
                        target="_blank" rel="noopener noreferrer"
                        title="Abrir WhatsApp com texto do pedido"
                        className="h-9 w-9 grid place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors active:scale-[0.98]"
                      >
                        <MessageCircle {...sw} className="w-4 h-4" />
                      </a>
                      <a
                        href={`/pedido/${o.orderNumber}`} target="_blank" rel="noopener noreferrer"
                        title="Ver comanda publica"
                        className="h-9 w-9 grid place-items-center rounded-lg border border-stone-800 text-stone-400 hover:text-sky-400 hover:border-sky-500/40 transition-colors active:scale-[0.98]"
                      >
                        <ExternalLink {...sw} className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => setPrinting(o)}
                        title="Imprimir comanda"
                        className="h-9 w-9 grid place-items-center rounded-lg border border-stone-800 text-stone-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors active:scale-[0.98]"
                      >
                        <Printer {...sw} className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && (
          <p className="py-14 text-center text-sm text-stone-500">Nenhuma comanda registrada.</p>
        )}
      </div>

      {/* area imprimivel — comanda A5 estruturada */}
      {printing && (
        <div id="ticket-print" className="hidden print:block fixed inset-0 z-[999] bg-white text-black overflow-auto">
          <div
            className="mx-auto font-sans"
            style={{ maxWidth: "520px", padding: "24px 28px", fontSize: "13px", lineHeight: 1.5 }}
          >
            {/* Header */}
            <div style={{ textAlign: "center", borderBottom: "3px solid #000", paddingBottom: "12px", marginBottom: "16px" }}>
              <p style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "2px", margin: 0 }}>ESTILO PRIME STORE</p>
              <p style={{ fontSize: "11px", color: "#555", margin: "4px 0 0" }}>Moda Masculina · @estiloprime.store</p>
            </div>

            {/* Comanda info */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", padding: "8px 12px", background: "#f5f5f5", borderRadius: "6px" }}>
              <div>
                <p style={{ fontSize: "10px", color: "#777", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>Comanda</p>
                <p style={{ fontSize: "18px", fontWeight: 800, margin: "2px 0 0" }}>#{printing.orderNumber}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "10px", color: "#777", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>Data</p>
                <p style={{ fontSize: "12px", fontWeight: 600, margin: "2px 0 0" }}>{fmtDateTime(printing.createdAt)}</p>
              </div>
            </div>

            {/* Status */}
            <div style={{ marginBottom: "16px", padding: "8px 12px", border: "2px solid #000", borderRadius: "6px", textAlign: "center" }}>
              <p style={{ fontSize: "10px", color: "#777", margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>Status</p>
              <p style={{ fontSize: "16px", fontWeight: 800, margin: "2px 0 0" }}>
                {ORDER_STATUS_META[printing.status].label.toUpperCase()}
              </p>
            </div>

            {/* Itens */}
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "10px", color: "#777", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Itens do Pedido</p>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #000" }}>
                    <th style={{ textAlign: "left", padding: "6px 0", fontSize: "10px", fontWeight: 700, textTransform: "uppercase" }}>Produto</th>
                    <th style={{ textAlign: "center", padding: "6px 0", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", width: "50px" }}>Tam</th>
                    <th style={{ textAlign: "center", padding: "6px 0", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", width: "40px" }}>Qtd</th>
                    <th style={{ textAlign: "right", padding: "6px 0", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", width: "70px" }}>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {printing.items?.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "8px 0", fontWeight: 500 }}>{item.productName}</td>
                      <td style={{ padding: "8px 0", textAlign: "center" }}>{item.size}</td>
                      <td style={{ padding: "8px 0", textAlign: "center", fontWeight: 700 }}>{item.quantity}x</td>
                      <td style={{ padding: "8px 0", textAlign: "right", fontWeight: 600 }}>{brl(item.price * item.quantity)}</td>
                    </tr>
                  )) || printing.itemsSummary.map((s, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                      <td colSpan={4} style={{ padding: "8px 0" }}>{s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totais */}
            <div style={{ borderTop: "3px solid #000", paddingTop: "12px", marginBottom: "16px" }}>
              {printing.deliveryFee > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ color: "#555" }}>Frete</span>
                  <span>{brl(printing.deliveryFee)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: 800 }}>
                <span>TOTAL</span>
                <span>{brl(printing.totalAmount)}</span>
              </div>
            </div>

            {/* Pagamento */}
            <div style={{ marginBottom: "16px", padding: "10px 12px", border: "2px dashed #999", borderRadius: "6px" }}>
              <p style={{ fontSize: "10px", color: "#777", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "1px" }}>Forma de Pagamento</p>
              <p style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>
                {printing.paymentMethod || "A definir"}
              </p>
              {settings.paymentPixEnabled && (
                <p style={{ fontSize: "11px", color: "#555", margin: "4px 0 0" }}>
                  Pix: {settings.pixKeyType} · {settings.pixKey}
                </p>
              )}
            </div>

            {/* Cliente */}
            <div style={{ marginBottom: "16px", padding: "10px 12px", background: "#f5f5f5", borderRadius: "6px" }}>
              <p style={{ fontSize: "10px", color: "#777", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "1px" }}>Cliente</p>
              <p style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>{printing.customerName}</p>
              <p style={{ fontSize: "12px", color: "#555", margin: "2px 0 0" }}>Tel: {printing.customerPhone}</p>
              <p style={{ fontSize: "12px", color: "#555", margin: "2px 0 0" }}>Entrega: {printing.deliveryType}</p>
            </div>

            {/* Footer */}
            <div style={{ textAlign: "center", borderTop: "1px solid #ddd", paddingTop: "12px", marginTop: "20px" }}>
              <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>Obrigado pela preferencia!</p>
              <p style={{ fontSize: "9px", color: "#999", margin: "4px 0 0" }}>NAO E DOCUMENTO FISCAL</p>
            </div>
          </div>
          <button
            onClick={() => setPrinting(null)}
            className="fixed bottom-4 right-4 print:hidden h-11 px-5 rounded-lg bg-stone-900 text-white text-xs font-bold shadow-lg"
          >
            Fechar visualizacao
          </button>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #ticket-print, #ticket-print * { visibility: visible !important; }
          #admin-root { display: none !important; }
          #ticket-print { position: fixed; top: 0; left: 0; width: 100%; }
          @page { size: A5 portrait; margin: 10mm; }
        }
      `}</style>
    </>
  );
}
