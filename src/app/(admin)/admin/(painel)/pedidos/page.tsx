import OrdersTable, { type OrderRow, type StoreSettings } from "@/components/admin/OrdersTable";
import { getOrders, getSettings, getCustomers } from "@/lib/db/store";
import type { OrderStatusEnum } from "@/lib/schemas/admin.schema";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const [orders, s, customers] = await Promise.all([getOrders(), getSettings(), getCustomers()]);
  const phoneMap = new Map(customers.map((c) => [c.phone, c.id]));

  const storeSettings: StoreSettings = {
    whatsappNumber: s.whatsappNumber,
    pixKey: s.pixKey,
    pixKeyType: s.pixKeyType,
    pixName: s.pixName,
    paymentCashEnabled: s.paymentCashEnabled,
    paymentPixEnabled: s.paymentPixEnabled,
    paymentCardEnabled: s.paymentCardEnabled,
  };

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    deliveryType: o.deliveryType,
    deliveryFee: o.deliveryFee,
    totalAmount: o.totalAmount,
    status: o.status as OrderStatusEnum,
    createdAt: o.createdAt,
    itemsSummary: o.items.map((i) => `${i.quantity}x ${i.productName} · ${i.size}`),
    customerId: phoneMap.get(o.customerPhone) ?? null,
    items: o.items.map((i) => ({ productName: i.productName, size: i.size, quantity: i.quantity, price: i.price })),
  }));

  return (
    <div>
      <p className="text-xs text-stone-500 mb-4">
        {rows.length} comandas · toque no status para atualizar em tempo real
      </p>
      <OrdersTable orders={rows} settings={storeSettings} />
    </div>
  );
}
