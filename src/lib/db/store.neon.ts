import { sql, isDbEnabled } from "./sql";
import type { Category, OrderStatus, LeadStage, CommType, CommDirection, ProductT, ProductImageT, ProductVariantT, DeliveryZoneT, StoreSettingT, OrderT, OrderItemT, CustomerT, LeadT, CommunicationT } from "./store";

// Re-export types for convenience
export type { Category, OrderStatus, LeadStage, CommType, CommDirection, ProductT, ProductImageT, ProductVariantT, DeliveryZoneT, StoreSettingT, OrderT, OrderItemT, CustomerT, LeadT, CommunicationT };

function toNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  return Number(v);
}

// ---------- Products ----------
export async function getProductsNeon(): Promise<ProductT[]> {
  if (!isDbEnabled() || !sql) throw new Error("DB not enabled");
  const products = await sql`SELECT id, name, slug, description, price, old_price, category, is_active, created_at FROM products ORDER BY created_at DESC`;
  const images = await sql`SELECT id, product_id, url, is_cover, sort_order FROM product_images ORDER BY product_id, sort_order`;
  const variants = await sql`SELECT id, product_id, size, stock FROM product_variants ORDER BY product_id, size`;
  const imgMap = new Map<string, ProductImageT[]>();
  for (const r of images as any[]) {
    const arr = imgMap.get(r.product_id) || [];
    arr.push({ id: r.id, url: r.url, isCover: r.is_cover, order: r.sort_order });
    imgMap.set(r.product_id, arr);
  }
  const varMap = new Map<string, ProductVariantT[]>();
  for (const r of variants as any[]) {
    const arr = varMap.get(r.product_id) || [];
    arr.push({ id: r.id, size: r.size, stock: r.stock });
    varMap.set(r.product_id, arr);
  }
  return (products as any[]).map(r => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    description: r.description || "",
    price: toNumber(r.price),
    oldPrice: toNumber(r.old_price),
    category: r.category as Category,
    isActive: r.is_active,
    images: imgMap.get(r.id) || [],
    variants: varMap.get(r.id) || [],
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  }));
}

export async function getProductNeon(id: string): Promise<ProductT | undefined> {
  const all = await getProductsNeon();
  return all.find(p => p.id === id);
}

export async function getProductBySlugNeon(slug: string): Promise<ProductT | undefined> {
  if (!isDbEnabled() || !sql) throw new Error("DB not enabled");
  const rows = await sql`SELECT id FROM products WHERE slug = ${slug} LIMIT 1`;
  if (!rows.length) return undefined;
  return getProductNeon((rows[0] as any).id);
}

// ---------- Zones ----------
export async function getZonesNeon(): Promise<DeliveryZoneT[]> {
  if (!isDbEnabled() || !sql) throw new Error("DB not enabled");
  const rows = await sql`SELECT id, location, fee, is_active FROM delivery_zones ORDER BY location`;
  return (rows as any[]).map(r => ({
    id: r.id,
    location: r.location,
    fee: toNumber(r.fee),
    isActive: r.is_active,
  }));
}

// ---------- Settings ----------
export async function getSettingsNeon(): Promise<StoreSettingT> {
  if (!isDbEnabled() || !sql) throw new Error("DB not enabled");
  const rows = await sql`SELECT whatsapp_number, pix_key, pix_key_type, pix_name, free_delivery_enabled, pickup_enabled, payment_cash_enabled, payment_pix_enabled, payment_card_enabled, pix_qr_code FROM store_settings WHERE id = 1`;
  if (!rows.length) {
    return {
      whatsappNumber: "5588999999999",
      pixKey: "88999999999",
      pixKeyType: "CELULAR",
      pixName: "Estilo Prime Store LTDA",
      freeDeliveryEnabled: true,
      pickupEnabled: true,
      paymentCashEnabled: true,
      paymentPixEnabled: true,
      paymentCardEnabled: false,
      pixQrCode: "",
    };
  }
  const r = (rows[0] as any);
  return {
    whatsappNumber: r.whatsapp_number,
    pixKey: r.pix_key,
    pixKeyType: r.pix_key_type,
    pixName: r.pix_name,
    freeDeliveryEnabled: r.free_delivery_enabled,
    pickupEnabled: r.pickup_enabled,
    paymentCashEnabled: r.payment_cash_enabled,
    paymentPixEnabled: r.payment_pix_enabled,
    paymentCardEnabled: r.payment_card_enabled,
    pixQrCode: r.pix_qr_code || "",
  };
}

// ---------- Orders ----------
export async function getOrdersNeon(): Promise<OrderT[]> {
  if (!isDbEnabled() || !sql) throw new Error("DB not enabled");
  const orders = await sql`SELECT id, order_number, customer_name, customer_phone, delivery_type, delivery_fee, total_amount, status, created_at FROM orders ORDER BY created_at DESC`;
  const items = await sql`SELECT id, order_id, variant_id, product_name, size, quantity, price FROM order_items`;
  const map = new Map<string, OrderItemT[]>();
  for (const r of items as any[]) {
    const arr = map.get(r.order_id) || [];
    arr.push({ variantId: r.variant_id, productName: r.product_name, size: r.size, quantity: r.quantity, price: toNumber(r.price) });
    map.set(r.order_id, arr);
  }
  return (orders as any[]).map(r => ({
    id: r.id,
    orderNumber: r.order_number,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    deliveryType: r.delivery_type,
    deliveryFee: toNumber(r.delivery_fee),
    totalAmount: toNumber(r.total_amount),
    status: r.status as OrderStatus,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    items: map.get(r.id) || [],
  }));
}

export async function getOrderPublicNeon(orderNumber: string): Promise<OrderT | undefined> {
  if (!isDbEnabled() || !sql) throw new Error("DB not enabled");
  const rows = await sql`SELECT id, order_number, customer_name, customer_phone, delivery_type, delivery_fee, total_amount, status, created_at FROM orders WHERE LOWER(order_number) = LOWER(${orderNumber}) LIMIT 1`;
  if (!rows.length) return undefined;
  const r = rows[0] as any;
  const items = await sql`SELECT variant_id, product_name, size, quantity, price FROM order_items WHERE order_id = ${r.id}`;
  return {
    id: r.id,
    orderNumber: r.order_number,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    deliveryType: r.delivery_type,
    deliveryFee: toNumber(r.delivery_fee),
    totalAmount: toNumber(r.total_amount),
    status: r.status,
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    items: (items as any[]).map(it => ({
      variantId: it.variant_id,
      productName: it.product_name,
      size: it.size,
      quantity: it.quantity,
      price: toNumber(it.price),
    })),
  };
}

// ---------- Customers ----------
export async function getCustomersNeon(): Promise<CustomerT[]> {
  if (!isDbEnabled() || !sql) throw new Error("DB not enabled");
  const rows = await sql`SELECT id, name, phone, email, cpf, address, city, notes, tags, created_at, total_orders, total_spent, last_order_at FROM customers ORDER BY created_at DESC`;
  return (rows as any[]).map(r => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email || "",
    cpf: r.cpf || "",
    address: r.address || "",
    city: r.city || "",
    notes: r.notes || "",
    tags: Array.isArray(r.tags) ? r.tags : (r.tags ? JSON.parse(r.tags) : []),
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    totalOrders: r.total_orders || 0,
    totalSpent: toNumber(r.total_spent),
    lastOrderAt: r.last_order_at ? (r.last_order_at instanceof Date ? r.last_order_at.toISOString() : String(r.last_order_at)) : null,
  }));
}

export async function getCustomerNeon(id: string): Promise<CustomerT | undefined> {
  if (!isDbEnabled() || !sql) throw new Error("DB not enabled");
  const rows = await sql`SELECT id, name, phone, email, cpf, address, city, notes, tags, created_at, total_orders, total_spent, last_order_at FROM customers WHERE id = ${id} LIMIT 1`;
  if (!rows.length) return undefined;
  const r = rows[0] as any;
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email || "",
    cpf: r.cpf || "",
    address: r.address || "",
    city: r.city || "",
    notes: r.notes || "",
    tags: Array.isArray(r.tags) ? r.tags : (r.tags ? JSON.parse(r.tags) : []),
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    totalOrders: r.total_orders || 0,
    totalSpent: toNumber(r.total_spent),
    lastOrderAt: r.last_order_at ? (r.last_order_at instanceof Date ? r.last_order_at.toISOString() : String(r.last_order_at)) : null,
  };
}

// ---------- Leads ----------
export async function getLeadsNeon(): Promise<LeadT[]> {
  if (!isDbEnabled() || !sql) throw new Error("DB not enabled");
  const rows = await sql`SELECT id, customer_id, name, phone, email, source, stage, value, notes, created_at, updated_at, closed_at FROM leads ORDER BY updated_at DESC`;
  return (rows as any[]).map(r => ({
    id: r.id,
    customerId: r.customer_id,
    name: r.name,
    phone: r.phone,
    email: r.email || "",
    source: r.source,
    stage: r.stage as LeadStage,
    value: toNumber(r.value),
    notes: r.notes || "",
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    closedAt: r.closed_at ? (r.closed_at instanceof Date ? r.closed_at.toISOString() : String(r.closed_at)) : null,
  }));
}

export async function getLeadNeon(id: string): Promise<LeadT | undefined> {
  if (!isDbEnabled() || !sql) throw new Error("DB not enabled");
  const rows = await sql`SELECT id, customer_id, name, phone, email, source, stage, value, notes, created_at, updated_at, closed_at FROM leads WHERE id = ${id} LIMIT 1`;
  if (!rows.length) return undefined;
  const r = rows[0] as any;
  return {
    id: r.id,
    customerId: r.customer_id,
    name: r.name,
    phone: r.phone,
    email: r.email || "",
    source: r.source,
    stage: r.stage,
    value: toNumber(r.value),
    notes: r.notes || "",
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    closedAt: r.closed_at ? (r.closed_at instanceof Date ? r.closed_at.toISOString() : String(r.closed_at)) : null,
  };
}

export async function getLeadsByStageNeon(): Promise<Map<LeadStage, LeadT[]>> {
  const leads = await getLeadsNeon();
  const stages: LeadStage[] = ["LEAD", "CONTATO", "PROPOSTA", "NEGOCIACAO", "FECHADO_GANHO", "FECHADO_PERDIDO"];
  const map = new Map<LeadStage, LeadT[]>();
  for (const s of stages) map.set(s, []);
  for (const l of leads) map.get(l.stage)!.push(l);
  return map;
}

// ---------- Communications ----------
export async function getCommunicationsNeon(): Promise<CommunicationT[]> {
  if (!isDbEnabled() || !sql) throw new Error("DB not enabled");
  const rows = await sql`SELECT id, customer_id, lead_id, order_id, type, direction, subject, notes, created_at FROM communications ORDER BY created_at DESC`;
  return (rows as any[]).map(r => ({
    id: r.id,
    customerId: r.customer_id,
    leadId: r.lead_id,
    orderId: r.order_id,
    type: r.type as CommType,
    direction: r.direction as CommDirection,
    subject: r.subject,
    notes: r.notes || "",
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
  }));
}

// ---------- Metrics ----------
export async function getMetricsNeon(rangeDays = 30) {
  const orders = await getOrdersNeon();
  const products = await getProductsNeon();
  const withinDays = (iso: string, n: number) => Date.now() - +new Date(iso) <= n * 864e5;
  const valid = orders.filter(o => o.status !== "CANCELLED");
  const cur = valid.filter(o => withinDays(o.createdAt, rangeDays));
  const prev = valid.filter(o => !withinDays(o.createdAt, rangeDays));
  const revenue = cur.reduce((s, o) => s + o.totalAmount, 0);
  const prevRevenue = prev.reduce((s, o) => s + o.totalAmount, 0);
  const itemsSold = cur.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0);
  const prevItemsSold = prev.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0);
  const statusCount = orders.reduce<Record<OrderStatus, number>>((acc, o) => { acc[o.status]++; return acc; }, { PENDING: 0, PREPARING: 0, DELIVERED: 0, CANCELLED: 0 });
  const allVariants = products.flatMap(p => p.isActive ? p.variants.map(v => ({ product: p, v })) : []);
  const stockAlerts = allVariants.filter(({ v }) => v.stock < 2).length;
  const byCategory = new Map<string, number>();
  for (const o of cur) for (const it of o.items) {
    const prod = products.find(p => p.name === it.productName);
    if (!prod) continue;
    byCategory.set(prod.category, (byCategory.get(prod.category) ?? 0) + it.price * it.quantity);
  }
  const catColors: Record<string, string> = { POLOS: "#f59e0b", CAMISETAS: "#d97706", BERMUDAS: "#84cc16", CONJUNTOS: "#38bdf8", ACESSORIOS: "#a78bfa" };
  const categorySplit = Array.from(byCategory.entries()).map(([k, value]) => ({ key: k, value, color: catColors[k] })).sort((a, b) => b.value - a.value);
  const zoneMap = new Map<string, number>();
  for (const o of cur) zoneMap.set(o.deliveryType, (zoneMap.get(o.deliveryType) ?? 0) + 1);
  const totalZone = cur.length || 1;
  const zoneSplit = Array.from(zoneMap.entries()).map(([location, count]) => ({ location, count, pct: Math.round((count / totalZone) * 100) })).sort((a, b) => b.count - a.count);
  const series: { day: string; revenue: number; orders: number }[] = [];
  for (let d = rangeDays - 1; d >= 0; d--) {
    const dayStart = new Date(); dayStart.setDate(dayStart.getDate() - d); dayStart.setHours(0, 0, 0, 0);
    const ofDay = cur.filter(o => { const t = +new Date(o.createdAt); return t >= +dayStart && t < +dayStart.getTime() + 864e5; });
    series.push({ day: dayStart.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""), revenue: +ofDay.reduce((s, o) => s + o.totalAmount, 0).toFixed(2), orders: ofDay.length });
  }
  return { revenue, prevRevenue, avgTicket: cur.length ? revenue / cur.length : 0, orderCount: cur.length, prevOrderCount: prev.length, itemsSold, prevItemsSold, stockAlerts, statusCount, categorySplit, zoneSplit, series };
}

export async function getPendingOrdersNeon() {
  const orders = await getOrdersNeon();
  return orders.filter(o => o.status === "PENDING");
}

export async function getRupturesNeon() {
  const products = await getProductsNeon();
  return products.map(p => ({ product: p, minStock: Math.min(...p.variants.map(v => v.stock)) })).filter(r => r.product.isActive && r.minStock <= 2).sort((a, b) => a.minStock - b.minStock);
}

export async function getCRMStatsNeon() {
  const leads = await getLeadsNeon();
  const customersRows = await getCustomersNeon();
  const commsRows = await getCommunicationsNeon();
  const totalLeads = leads.length;
  const activeLeads = leads.filter(l => !l.stage.startsWith("FECHADO")).length;
  const won = leads.filter(l => l.stage === "FECHADO_GANHO").length;
  const lost = leads.filter(l => l.stage === "FECHADO_PERDIDO").length;
  const closedTotal = won + lost;
  const conversionRate = closedTotal ? Math.round((won / closedTotal) * 100) : 0;
  const pipelineValue = leads.filter(l => !l.stage.startsWith("FECHADO")).reduce((s, l) => s + l.value, 0);
  const wonValue = leads.filter(l => l.stage === "FECHADO_GANHO").reduce((s, l) => s + l.value, 0);
  const totalCustomers = customersRows.length;
  const withinDays = (iso: string, n: number) => Date.now() - +new Date(iso) <= n * 864e5;
  const newCustomers30d = customersRows.filter(c => withinDays(c.createdAt, 30)).length;
  const totalComms = commsRows.length;
  const stageValues: { stage: LeadStage; count: number; value: number }[] = [];
  const stages: LeadStage[] = ["LEAD", "CONTATO", "PROPOSTA", "NEGOCIACAO", "FECHADO_GANHO", "FECHADO_PERDIDO"];
  for (const s of stages) {
    const byStage = leads.filter(l => l.stage === s);
    stageValues.push({ stage: s, count: byStage.length, value: byStage.reduce((sum, l) => sum + l.value, 0) });
  }
  const sourceMap = new Map<string, number>();
  for (const l of leads) sourceMap.set(l.source, (sourceMap.get(l.source) ?? 0) + 1);
  const sourceSplit = Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);
  return { totalLeads, activeLeads, won, lost, conversionRate, pipelineValue, wonValue, totalCustomers, newCustomers30d, totalComms, stageValues, sourceSplit };
}

// ---------- Admin ----------
export async function getAdminNeon() {
  if (!isDbEnabled() || !sql) throw new Error("DB not enabled");
  const rows = await sql`SELECT email, name, pass_hash FROM admin_users LIMIT 1`;
  if (!rows.length) return null;
  const r = rows[0] as any;
  return { email: r.email, name: r.name, passHash: r.pass_hash };
}

// ---------- Gallery / Hero / Looks for site.html ----------
export async function getHeroSlidesNeon() {
  if (!isDbEnabled() || !sql) return [];
  try {
    const rows = await sql`SELECT id, title, subtitle, image_url, cta_text, cta_link, display_order, is_active FROM hero_slides WHERE is_active = true ORDER BY display_order`;
    return rows;
  } catch { return []; }
}
export async function getGalleryNeon() {
  if (!isDbEnabled() || !sql) return [];
  try {
    const rows = await sql`SELECT id, title, image_url, photo_type, display_order, is_active FROM gallery_photos WHERE is_active = true ORDER BY display_order`;
    return rows;
  } catch { return []; }
}
export async function getLooksNeon() {
  if (!isDbEnabled() || !sql) return [];
  try {
    const rows = await sql`SELECT id, title, image_url, display_order, is_active FROM looks WHERE is_active = true ORDER BY display_order`;
    return rows;
  } catch { return []; }
}
