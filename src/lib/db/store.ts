import { randomUUID, createHash } from "crypto";
import { sql, isDbEnabled } from "./sql";

export type Category = "POLOS" | "CAMISETAS" | "BERMUDAS" | "CONJUNTOS" | "ACESSORIOS";
export type OrderStatus = "PENDING" | "PREPARING" | "DELIVERED" | "CANCELLED";
export type LeadStage = "LEAD" | "CONTATO" | "PROPOSTA" | "NEGOCIACAO" | "FECHADO_GANHO" | "FECHADO_PERDIDO";
export type CommType = "WHATSAPP" | "TELEFONE" | "PRESENCIAL" | "EMAIL" | "INSTAGRAM";
export type CommDirection = "ENVIADA" | "RECEBIDA";

export interface ProductImageT { id: string; url: string; isCover: boolean; order: number }
export interface ProductVariantT { id: string; size: string; stock: number }
export interface ProductT {
  id: string; name: string; slug: string; description: string;
  price: number; oldPrice: number; category: Category; isActive: boolean;
  images: ProductImageT[]; variants: ProductVariantT[];
  createdAt: string;
}
export interface DeliveryZoneT { id: string; location: string; fee: number; isActive: boolean }
export interface StoreSettingT {
  whatsappNumber: string; pixKey: string; pixKeyType: string; pixName: string;
  freeDeliveryEnabled: boolean; pickupEnabled: boolean;
  paymentCashEnabled: boolean; paymentPixEnabled: boolean; paymentCardEnabled: boolean;
  pixQrCode: string;
}
export interface OrderItemT { variantId: string; productName: string; size: string; quantity: number; price: number }
export interface OrderT {
  id: string; orderNumber: string; customerName: string; customerPhone: string;
  deliveryType: string; deliveryFee: number; totalAmount: number;
  status: OrderStatus; createdAt: string; items: OrderItemT[];
}

export interface CustomerT {
  id: string; name: string; phone: string; email: string; cpf: string;
  address: string; city: string; notes: string; tags: string[];
  createdAt: string; totalOrders: number; totalSpent: number; lastOrderAt: string | null;
}
export interface LeadT {
  id: string; customerId: string | null; name: string; phone: string; email: string;
  source: string; stage: LeadStage; value: number; notes: string;
  createdAt: string; updatedAt: string; closedAt: string | null;
}
export interface CommunicationT {
  id: string; customerId: string | null; leadId: string | null; orderId: string | null;
  type: CommType; direction: CommDirection; subject: string; notes: string; createdAt: string;
}

interface AdminUserT { email: string; name: string; passHash: string }

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const daysAgo = (n: number, hour = 12) => {
  const d = new Date(); d.setDate(d.getDate() - n); d.setHours(hour, (n * 7) % 60, 0, 0);
  return d.toISOString();
};

const img = (id: number, seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=900&q=85`;

function makeProduct(
  p: Omit<ProductT, "id" | "images" | "variants" | "createdAt"> & {
    imageSeeds: string[]; stocks?: Record<string, number>;
  }
): ProductT {
  const stocks = p.stocks ?? {};
  return {
    id: randomUUID(),
    createdAt: daysAgo(40),
    ...p,
    images: p.imageSeeds.map((s, i) => ({ id: randomUUID(), url: img(i, s), isCover: i === 0, order: i })),
    variants: (["P", "M", "G", "GG"] as const).map((size) => ({
      id: randomUUID(), size, stock: stocks[size] ?? 4,
    })),
  };
}

const seedProducts: ProductT[] = [
  makeProduct({
    name: "Polo Tech Black Zíper Masculina",
    slug: "polo-tech-black-ziper",
    description: "Malha estruturada com elastano e tecnologia anti-suor. Zíper frontal inoxidável.",
    price: 89.9, oldPrice: 119.9, category: "POLOS", isActive: true,
    imageSeeds: ["1620799140408-edc6dcb6d633"],
    stocks: { P: 3, M: 6, G: 1, GG: 2 },
  }),
  makeProduct({
    name: "Camiseta Oversized Vintage Black",
    slug: "oversized-vintage-black",
    description: "Boxy cut, ombro caído e gola grossa 3cm. Algodão penteado 240g/m².",
    price: 79.9, oldPrice: 99.9, category: "CAMISETAS", isActive: true,
    imageSeeds: ["1574180566232-aaad1b5b8450", "1576566588028-4147f3842f27"],
    stocks: { P: 5, M: 8, G: 7, GG: 3 },
  }),
  makeProduct({
    name: "Polo Tech Sand Areia Zíper",
    slug: "polo-tech-sand-areia",
    description: "Tom areia nobre com acabamento acetinado.",
    price: 89.9, oldPrice: 119.9, category: "POLOS", isActive: true,
    imageSeeds: ["1594938298603-c8148c4dae35"],
    stocks: { P: 2, M: 5, G: 3, GG: 1 },
  }),
  makeProduct({
    name: "Bermuda Linho Areia Alfaiataria",
    slug: "bermuda-linho-areia",
    description: "Linho misto com corte acima do joelho e cós com cordão de ajuste.",
    price: 79.9, oldPrice: 109.9, category: "BERMUDAS", isActive: true,
    imageSeeds: ["1562247879-0eac107b7e76"],
    stocks: { P: 0, M: 5, G: 4, GG: 2 },
  }),
  makeProduct({
    name: "Slim Fit Algodão Off-White",
    slug: "slim-fit-off-white",
    description: "Fio 30.1 penteado com toque peletizado.",
    price: 59.9, oldPrice: 79.9, category: "CAMISETAS", isActive: true,
    imageSeeds: ["1489987707025-afc232f7ea0f"],
    stocks: { P: 4, M: 6, G: 5, GG: 3 },
  }),
  makeProduct({
    name: "Oversized Acid Wash Heavyweight",
    slug: "oversized-acid-wash",
    description: "Lavagem mineral acid wash exclusiva da Estilo Prime.",
    price: 84.9, oldPrice: 110, category: "CAMISETAS", isActive: false,
    imageSeeds: ["1598033129183-c4f50c736f10"],
    stocks: { P: 2, M: 4, G: 3, GG: 1 },
  }),
  makeProduct({
    name: "Conjunto Polo Tech + Bermuda Linho",
    slug: "conjunto-polo-linho",
    description: "Look completo smart casual para o clima cearense.",
    price: 149.9, oldPrice: 189.9, category: "CONJUNTOS", isActive: true,
    imageSeeds: ["1552374196-1ab2a1c593e8"],
    stocks: { P: 2, M: 3, G: 2, GG: 1 },
  }),
  makeProduct({
    name: "Boné Dad Hat Minimalist EP",
    slug: "bone-dad-hat-ep",
    description: "Sarja peletizada com bordado do monograma EP.",
    price: 49.9, oldPrice: 69.9, category: "ACESSORIOS", isActive: true,
    imageSeeds: ["1516826957135-700dedea698c"],
    stocks: { P: 10, M: 10, G: 8, GG: 0 },
  }),
];

const ZONES: DeliveryZoneT[] = [
  { id: randomUUID(), location: "Itaiçaba (Local)", fee: 0, isActive: true },
  { id: randomUUID(), location: "Retirada no Balcão", fee: 0, isActive: true },
  { id: randomUUID(), location: "Jaguaruana", fee: 10, isActive: true },
  { id: randomUUID(), location: "Palhano", fee: 8, isActive: true },
  { id: randomUUID(), location: "Russas", fee: 20, isActive: true },
  { id: randomUUID(), location: "Aracati", fee: 15, isActive: false },
];

const SETTINGS: StoreSettingT = {
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

const CUSTOMERS = [
  ["Carlos Eduardo", "88998123456"], ["Rafael Lima", "88997456123"],
  ["João Pedro", "88996111222"], ["Matheus Souza", "88993334444"],
  ["Lucas Andrade", "88995556666"], ["Felipe Castro", "88997778888"],
  ["Bruno Rocha", "88991239876"], ["Diego Martins", "88999887766"],
] as const;

/* ---------------- seed CRM ---------------- */

const seedCustomers: CustomerT[] = [
  { id: randomUUID(), name: "Carlos Eduardo", phone: "88998123456", email: "carlos@email.com", cpf: "000.111.222-33", address: "Rua das Flores, 120", city: "Itaiçaba", notes: "Cliente fiel, compra todo mês", tags: ["VIP", "Fiel"], createdAt: daysAgo(60), totalOrders: 5, totalSpent: 689.50, lastOrderAt: daysAgo(2) },
  { id: randomUUID(), name: "Rafael Lima", phone: "88997456123", email: "rafael@email.com", cpf: "111.222.333-44", address: "Av. Principal, 450", city: "Jaguaruana", notes: "Indicado pelo Carlos", tags: ["Indicação"], createdAt: daysAgo(45), totalOrders: 3, totalSpent: 329.70, lastOrderAt: daysAgo(8) },
  { id: randomUUID(), name: "João Pedro", phone: "88996111222", email: "joao@email.com", cpf: "", address: "Rua do Sol, 78", city: "Russas", notes: "Compra presentes para namorada", tags: [], createdAt: daysAgo(30), totalOrders: 2, totalSpent: 179.80, lastOrderAt: daysAgo(12) },
  { id: randomUUID(), name: "Matheus Souza", phone: "88993334444", email: "matheus@email.com", cpf: "333.444.555-66", address: "Rua da Paz, 310", city: "Palhano", notes: "Prefere polos tech", tags: ["Atacado"], createdAt: daysAgo(90), totalOrders: 8, totalSpent: 1245.00, lastOrderAt: daysAgo(1) },
  { id: randomUUID(), name: "Lucas Andrade", phone: "88995556666", email: "", cpf: "", address: "", city: "Itaiçaba", notes: "Retira no balcão sempre", tags: ["Balcão"], createdAt: daysAgo(15), totalOrders: 4, totalSpent: 359.60, lastOrderAt: daysAgo(5) },
  { id: randomUUID(), name: "Felipe Castro", phone: "88997778888", email: "felipe@email.com", cpf: "555.666.777-88", address: "Rua Nova, 90", city: "Itaiçaba", notes: "", tags: [], createdAt: daysAgo(10), totalOrders: 1, totalSpent: 89.90, lastOrderAt: daysAgo(10) },
  { id: randomUUID(), name: "Bruno Rocha", phone: "88991239876", email: "bruno@email.com", cpf: "", address: "Av. Beira Mar, 200", city: "Aracati", notes: "Cliente de praia, gosta de bermudas", tags: [], createdAt: daysAgo(7), totalOrders: 2, totalSpent: 159.80, lastOrderAt: daysAgo(3) },
  { id: randomUUID(), name: "Diego Martins", phone: "88999887766", email: "", cpf: "", address: "", city: "Russas", notes: "Novo cliente, veio do Instagram", tags: ["Instagram"], createdAt: daysAgo(3), totalOrders: 1, totalSpent: 79.90, lastOrderAt: daysAgo(3) },
  { id: randomUUID(), name: "Gabriel Costa", phone: "88991112233", email: "gabriel@email.com", cpf: "777.888.999-00", address: "Rua do Comércio, 55", city: "Jaguaruana", notes: "Compra para revenda", tags: ["Atacado", "VIP"], createdAt: daysAgo(120), totalOrders: 12, totalSpent: 2890.00, lastOrderAt: daysAgo(4) },
  { id: randomUUID(), name: "Thiago Almeida", phone: "88994445566", email: "thiago@email.com", cpf: "", address: "", city: "Palhano", notes: "Indicado pelo Matheus", tags: ["Indicação"], createdAt: daysAgo(20), totalOrders: 2, totalSpent: 169.80, lastOrderAt: daysAgo(6) },
  { id: randomUUID(), name: "Pedro Henrique", phone: "88996667788", email: "", cpf: "", address: "Rua das Acácias, 12", city: "Itaiçaba", notes: "Estudante, gosta de camisetas", tags: [], createdAt: daysAgo(5), totalOrders: 1, totalSpent: 59.90, lastOrderAt: daysAgo(5) },
  { id: randomUUID(), name: "Marcos Vinícius", phone: "88992223344", email: "marcos@email.com", cpf: "222.333.444-55", address: "Rua do Portão, 88", city: "Russas", notes: "Prefere entrega em casa", tags: [], createdAt: daysAgo(40), totalOrders: 3, totalSpent: 269.70, lastOrderAt: daysAgo(9) },
];

function seedLeads(cats: CustomerT[]): LeadT[] {
  const stages: LeadStage[] = ["LEAD", "CONTATO", "PROPOSTA", "NEGOCIACAO", "FECHADO_GANHO", "FECHADO_PERDIDO"];
  const sources = ["WhatsApp", "Instagram", "Indicação", "Balcão", "Site"];
  const leadData: { name: string; phone: string; email: string; source: string; stage: LeadStage; value: number; notes: string; daysAgoN: number; customerId: string | null }[] = [
    { name: "Ana Beatriz", phone: "88990001122", email: "ana@email.com", source: "Instagram", stage: "LEAD", value: 200, notes: "Interessada em conjunto polo+bermuda", daysAgoN: 2, customerId: null },
    { name: "Carlos Eduardo", phone: "88998123456", email: "carlos@email.com", source: "WhatsApp", stage: "NEGOCIACAO", value: 450, notes: "Quer 3 polos para presente", daysAgoN: 5, customerId: cats[0]?.id ?? null },
    { name: "Rafael Lima", phone: "88997456123", email: "rafael@email.com", source: "Indicação", stage: "PROPOSTA", value: 180, notes: "Indicado pelo Carlos, interessado em camisetas", daysAgoN: 8, customerId: cats[1]?.id ?? null },
    { name: "Fernanda Dias", phone: "88993330011", email: "fernanda@email.com", source: "WhatsApp", stage: "CONTATO", value: 320, notes: "Compra para marido, pediu catálogo", daysAgoN: 3, customerId: null },
    { name: "Lucas Andrade", phone: "88995556666", email: "", source: "Balcão", stage: "FECHADO_GANHO", value: 359.60, notes: "Comprou 4 vezes, sempre retira no balcão", daysAgoN: 15, customerId: cats[4]?.id ?? null },
    { name: "João Vitor", phone: "88997770088", email: "jv@email.com", source: "Site", stage: "LEAD", value: 100, notes: "Preencheu formulário VIP", daysAgoN: 1, customerId: null },
    { name: "Matheus Souza", phone: "88993334444", email: "matheus@email.com", source: "WhatsApp", stage: "FECHADO_GANHO", value: 1245, notes: "Maior comprador atacadista", daysAgoN: 30, customerId: cats[3]?.id ?? null },
    { name: "Camila Santos", phone: "88998887766", email: "camila@email.com", source: "Instagram", stage: "PROPOSTA", value: 280, notes: "Viu look no feed, quer mesmo conjunto", daysAgoN: 4, customerId: null },
    { name: "Bruno Rocha", phone: "88991239876", email: "bruno@email.com", source: "Indicação", stage: "NEGOCIACAO", value: 160, notes: "Quer bermudas de linho", daysAgoN: 7, customerId: cats[6]?.id ?? null },
    { name: "Gabriel Costa", phone: "88991112233", email: "gabriel@email.com", source: "WhatsApp", stage: "FECHADO_GANHO", value: 2890, notes: "Revendedor atacadista recorrente", daysAgoN: 45, customerId: cats[7]?.id ?? null },
    { name: "Renata Oliveira", phone: "88992220033", email: "", source: "Balcão", stage: "CONTATO", value: 150, notes: "Passou na loja, pegou cartão", daysAgoN: 6, customerId: null },
    { name: "Thiago Almeida", phone: "88994445566", email: "thiago@email.com", source: "Indicação", stage: "FECHADO_PERDIDO", value: 200, notes: "Desistiu por preço", daysAgoN: 18, customerId: cats[9]?.id ?? null },
  ];
  return leadData.map((l) => ({
    id: randomUUID(), customerId: l.customerId, name: l.name, phone: l.phone, email: l.email,
    source: l.source, stage: l.stage, value: l.value, notes: l.notes,
    createdAt: daysAgo(l.daysAgoN), updatedAt: daysAgo(Math.max(0, l.daysAgoN - 2)), closedAt: l.stage.startsWith("FECHADO") ? daysAgo(Math.max(0, l.daysAgoN - 1)) : null,
  }));
}

function seedComms(cats: CustomerT[], leads: LeadT[]): CommunicationT[] {
  const comms: CommunicationT[] = [];
  const types: CommType[] = ["WHATSAPP", "TELEFONE", "PRESENCIAL", "EMAIL", "INSTAGRAM"];
  const dirs: CommDirection[] = ["ENVIADA", "RECEBIDA"];
  const subjects = [
    "Saudação inicial", "Envio de catálogo", "Follow-up proposta", "Confirmação de pedido",
    "Dúvida sobre tamanho", "Agradecimento pela compra", "Retorno sobre entrega",
    "Nova coleção disponível", "Convite para evento", "Resolver problema troca",
  ];
  for (let i = 0; i < 24; i++) {
    const cat = cats[i % cats.length];
    const lead = leads[i % leads.length];
    comms.push({
      id: randomUUID(),
      customerId: i < cats.length ? cat.id : null,
      leadId: i % 3 === 0 ? lead.id : null,
      orderId: i < 6 ? `seed-${i}` : null,
      type: types[i % types.length],
      direction: dirs[i % 2],
      subject: subjects[i % subjects.length],
      notes: `Registro de interação ${i + 1} com ${cat.name}.`,
      createdAt: daysAgo(23 - Math.floor(i * 0.9)),
    });
  }
  return comms;
}

function seedOrders(products: ProductT[]): OrderT[] {
  const statuses: OrderStatus[] = [
    "DELIVERED","DELIVERED","DELIVERED","DELIVERED","DELIVERED","DELIVERED",
    "PREPARING","PREPARING","PENDING","PENDING","PENDING",
    "DELIVERED","CANCELLED","DELIVERED","PREPARING","DELIVERED",
  ];
  return statuses.map((status, i) => {
    const product = products[i % products.length];
    const variant = product.variants[i % 4];
    const qty = 1 + (i % 2);
    const zone = ZONES[i % ZONES.length];
    const [name, phone] = CUSTOMERS[i % CUSTOMERS.length];
    const sub = product.price * qty;
    return {
      id: randomUUID(),
      orderNumber: `EP-${1042 + i}`,
      customerName: name,
      customerPhone: phone,
      deliveryType: zone.location,
      deliveryFee: zone.fee,
      totalAmount: +(sub + zone.fee).toFixed(2),
      status,
      createdAt: daysAgo(29 - Math.round((i / statuses.length) * 28), 10 + (i % 8)),
      items: [{ variantId: variant.id, productName: product.name, size: variant.size, quantity: qty, price: product.price }],
    };
  });
}

interface DBShape {
  admin: AdminUserT;
  products: ProductT[];
  zones: DeliveryZoneT[];
  settings: StoreSettingT;
  orders: OrderT[];
  crmCustomers: CustomerT[];
  crmLeads: LeadT[];
  crmCommunications: CommunicationT[];
}

const g = globalThis as unknown as { __epDB?: DBShape };

export const db: DBShape = (g.__epDB ??= (() => {
  const products = seedProducts;
  const customers = [...seedCustomers];
  const leads = seedLeads(customers);
  return {
    admin: {
      email: "admin@estiloprime.store",
      name: "Lojista Prime",
      passHash: sha("prime2026"),
    },
    products,
    zones: ZONES,
    settings: SETTINGS,
    orders: seedOrders(products),
    crmCustomers: customers,
    crmLeads: leads,
    crmCommunications: seedComms(customers, leads),
  };
})());

/* ---------------- patch settings for HMR ( DB antigo sem novos campos ) ---------------- */
if ((db.settings as Partial<StoreSettingT>).paymentCashEnabled === undefined) {
  (db.settings as StoreSettingT).paymentCashEnabled = true;
}
if ((db.settings as Partial<StoreSettingT>).paymentPixEnabled === undefined) {
  (db.settings as StoreSettingT).paymentPixEnabled = true;
}
if ((db.settings as Partial<StoreSettingT>).paymentCardEnabled === undefined) {
  (db.settings as StoreSettingT).paymentCardEnabled = false;
}
if ((db.settings as Partial<StoreSettingT>).pixQrCode === undefined) {
  (db.settings as StoreSettingT).pixQrCode = "";
}

/* ---------------- helpers for Neon ---------------- */
function toNumber(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return v;
  return Number(v);
}

/* ---------------- queries (Neon-first, memory fallback) ---------------- */

export const getProducts = async (): Promise<ProductT[]> => {
  if (isDbEnabled() && sql) {
    try {
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
        id: r.id, name: r.name, slug: r.slug, description: r.description || "",
        price: toNumber(r.price), oldPrice: toNumber(r.old_price),
        category: r.category as Category, isActive: r.is_active,
        images: imgMap.get(r.id) || [], variants: varMap.get(r.id) || [],
        createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      }));
    } catch (e) { console.error("[store] getProducts Neon failed, fallback to memory", e); }
  }
  return db.products;
};
export const getProduct = async (id: string): Promise<ProductT | undefined> => {
  if (isDbEnabled() && sql) {
    try {
      const all = await getProducts();
      return all.find(p => p.id === id);
    } catch {}
  }
  return db.products.find((p) => p.id === id);
};

export const getZones = async (): Promise<DeliveryZoneT[]> => {
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT id, location, fee, is_active FROM delivery_zones ORDER BY location`;
      return (rows as any[]).map(r => ({ id: r.id, location: r.location, fee: toNumber(r.fee), isActive: r.is_active }));
    } catch (e) { console.error("[store] getZones Neon failed", e); }
  }
  return db.zones.filter((z) => z.isActive || true);
};
export const getSettings = async (): Promise<StoreSettingT> => {
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT whatsapp_number, pix_key, pix_key_type, pix_name, free_delivery_enabled, pickup_enabled, payment_cash_enabled, payment_pix_enabled, payment_card_enabled, pix_qr_code FROM store_settings WHERE id = 1`;
      if (rows.length) {
        const r = (rows[0] as any);
        return {
          whatsappNumber: r.whatsapp_number, pixKey: r.pix_key, pixKeyType: r.pix_key_type, pixName: r.pix_name,
          freeDeliveryEnabled: r.free_delivery_enabled, pickupEnabled: r.pickup_enabled,
          paymentCashEnabled: r.payment_cash_enabled, paymentPixEnabled: r.payment_pix_enabled, paymentCardEnabled: r.payment_card_enabled,
          pixQrCode: r.pix_qr_code || "",
        };
      }
    } catch (e) { console.error("[store] getSettings Neon failed", e); }
  }
  return {
    whatsappNumber: db.settings.whatsappNumber ?? "5588999999999",
    pixKey: db.settings.pixKey ?? "", pixKeyType: db.settings.pixKeyType ?? "CELULAR", pixName: db.settings.pixName ?? "",
    freeDeliveryEnabled: db.settings.freeDeliveryEnabled ?? true, pickupEnabled: db.settings.pickupEnabled ?? true,
    paymentCashEnabled: (db.settings as Partial<StoreSettingT>).paymentCashEnabled ?? true,
    paymentPixEnabled: (db.settings as Partial<StoreSettingT>).paymentPixEnabled ?? true,
    paymentCardEnabled: (db.settings as Partial<StoreSettingT>).paymentCardEnabled ?? false,
    pixQrCode: (db.settings as Partial<StoreSettingT>).pixQrCode ?? "",
  };
};

export const getOrders = async (): Promise<OrderT[]> => {
  if (isDbEnabled() && sql) {
    try {
      const orders = await sql`SELECT id, order_number, customer_name, customer_phone, delivery_type, delivery_fee, total_amount, status, created_at FROM orders ORDER BY created_at DESC`;
      const items = await sql`SELECT id, order_id, variant_id, product_name, size, quantity, price FROM order_items`;
      const map = new Map<string, OrderItemT[]>();
      for (const r of items as any[]) {
        const arr = map.get(r.order_id) || [];
        arr.push({ variantId: r.variant_id, productName: r.product_name, size: r.size, quantity: r.quantity, price: toNumber(r.price) });
        map.set(r.order_id, arr);
      }
      return (orders as any[]).map(r => ({
        id: r.id, orderNumber: r.order_number, customerName: r.customer_name, customerPhone: r.customer_phone,
        deliveryType: r.delivery_type, deliveryFee: toNumber(r.delivery_fee), totalAmount: toNumber(r.total_amount),
        status: r.status as OrderStatus, createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
        items: map.get(r.id) || [],
      }));
    } catch (e) { console.error("[store] getOrders Neon failed", e); }
  }
  return [...db.orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
};

const withinDays = (iso: string, n: number) =>
  Date.now() - +new Date(iso) <= n * 864e5;

export async function getMetrics(rangeDays = 30) {
  const orders = await getOrders();
  const products = await getProducts();
  const valid = orders.filter((o) => o.status !== "CANCELLED");
  const cur = valid.filter((o) => withinDays(o.createdAt, rangeDays));
  const prev = valid.filter((o) => !withinDays(o.createdAt, rangeDays));

  const revenue = cur.reduce((s, o) => s + o.totalAmount, 0);
  const prevRevenue = prev.reduce((s, o) => s + o.totalAmount, 0);
  const itemsSold = cur.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0);
  const prevItemsSold = prev.reduce((s, o) => s + o.items.reduce((a, i) => a + i.quantity, 0), 0);

  const statusCount = orders.reduce<Record<OrderStatus, number>>((acc, o) => {
    acc[o.status]++; return acc;
  }, { PENDING: 0, PREPARING: 0, DELIVERED: 0, CANCELLED: 0 });

  const allVariants = products.flatMap((p) =>
    p.isActive ? p.variants.map((v) => ({ product: p, v })) : []
  );
  const stockAlerts = allVariants.filter(({ v }) => v.stock < 2).length;

  const byCategory = new Map<Category, number>();
  for (const o of cur)
    for (const it of o.items) {
      const prod = products.find((p) => p.name === it.productName);
      if (!prod) continue;
      byCategory.set(prod.category, (byCategory.get(prod.category) ?? 0) + it.price * it.quantity);
    }

  const catColors: Record<string, string> = {
    POLOS: "#f59e0b", CAMISETAS: "#d97706", BERMUDAS: "#84cc16",
    CONJUNTOS: "#38bdf8", ACESSORIOS: "#a78bfa",
  };
  const categorySplit = Array.from(byCategory.entries())
    .map(([k, value]) => ({ key: k, value, color: catColors[k] }))
    .sort((a, b) => b.value - a.value);

  const zoneMap = new Map<string, number>();
  for (const o of cur) zoneMap.set(o.deliveryType, (zoneMap.get(o.deliveryType) ?? 0) + 1);
  const totalZone = cur.length || 1;
  const zoneSplit = Array.from(zoneMap.entries())
    .map(([location, count]) => ({ location, count, pct: Math.round((count / totalZone) * 100) }))
    .sort((a, b) => b.count - a.count);

  const series: { day: string; revenue: number; orders: number }[] = [];
  for (let d = rangeDays - 1; d >= 0; d--) {
    const dayStart = new Date(); dayStart.setDate(dayStart.getDate() - d); dayStart.setHours(0, 0, 0, 0);
    const ofDay = cur.filter((o) => {
      const t = +new Date(o.createdAt);
      return t >= +dayStart && t < +dayStart.getTime() + 864e5;
    });
    series.push({
      day: dayStart.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      revenue: +ofDay.reduce((s, o) => s + o.totalAmount, 0).toFixed(2),
      orders: ofDay.length,
    });
  }

  return {
    revenue,
    prevRevenue,
    avgTicket: cur.length ? revenue / cur.length : 0,
    orderCount: cur.length,
    prevOrderCount: prev.length,
    itemsSold,
    prevItemsSold,
    stockAlerts,
    statusCount,
    categorySplit,
    zoneSplit,
    series,
  };
}

export type MetricsT = Awaited<ReturnType<typeof getMetrics>>;

export async function getPendingOrders(): Promise<OrderT[]> {
  const orders = await getOrders();
  return orders.filter((o) => o.status === "PENDING");
}

export async function getRuptures(): Promise<{ product: ProductT; minStock: number }[]> {
  const products = await getProducts();
  return products
    .map((p) => ({ product: p, minStock: Math.min(...p.variants.map((v) => v.stock)) }))
    .filter((r) => r.product.isActive && r.minStock <= 2)
    .sort((a, b) => a.minStock - b.minStock);
}

export const getOrderPublic = async (orderNumber: string): Promise<OrderT | undefined> => {
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT id, order_number, customer_name, customer_phone, delivery_type, delivery_fee, total_amount, status, created_at FROM orders WHERE LOWER(order_number) = LOWER(${orderNumber}) LIMIT 1`;
      if (rows.length) {
        const r = rows[0] as any;
        const items = await sql`SELECT variant_id, product_name, size, quantity, price FROM order_items WHERE order_id = ${r.id}`;
        return {
          id: r.id, orderNumber: r.order_number, customerName: r.customer_name, customerPhone: r.customer_phone,
          deliveryType: r.delivery_type, deliveryFee: toNumber(r.delivery_fee), totalAmount: toNumber(r.total_amount),
          status: r.status as OrderStatus, createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
          items: (items as any[]).map(it => ({ variantId: it.variant_id, productName: it.product_name, size: it.size, quantity: it.quantity, price: toNumber(it.price) })),
        };
      }
    } catch (e) { console.error("[store] getOrderPublic Neon failed", e); }
  }
  return db.orders.find((o) => o.orderNumber.toLowerCase() === orderNumber.toLowerCase());
};

/* ---------------- CRM queries (Neon-first) ---------------- */

export const getCustomers = async (): Promise<CustomerT[]> => {
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT id, name, phone, email, cpf, address, city, notes, tags, created_at, total_orders, total_spent, last_order_at FROM customers ORDER BY created_at DESC`;
      return (rows as any[]).map(r => ({
        id: r.id, name: r.name, phone: r.phone, email: r.email || "", cpf: r.cpf || "", address: r.address || "", city: r.city || "", notes: r.notes || "",
        tags: Array.isArray(r.tags) ? r.tags : (r.tags ? JSON.parse(r.tags) : []),
        createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
        totalOrders: r.total_orders || 0, totalSpent: toNumber(r.total_spent),
        lastOrderAt: r.last_order_at ? (r.last_order_at instanceof Date ? r.last_order_at.toISOString() : String(r.last_order_at)) : null,
      }));
    } catch (e) { console.error("[store] getCustomers Neon failed", e); }
  }
  return [...db.crmCustomers].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
};

export const getCustomer = async (id: string): Promise<CustomerT | undefined> => {
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT id, name, phone, email, cpf, address, city, notes, tags, created_at, total_orders, total_spent, last_order_at FROM customers WHERE id = ${id} LIMIT 1`;
      if (rows.length) {
        const r = rows[0] as any;
        return {
          id: r.id, name: r.name, phone: r.phone, email: r.email || "", cpf: r.cpf || "", address: r.address || "", city: r.city || "", notes: r.notes || "",
          tags: Array.isArray(r.tags) ? r.tags : (r.tags ? JSON.parse(r.tags) : []),
          createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
          totalOrders: r.total_orders || 0, totalSpent: toNumber(r.total_spent),
          lastOrderAt: r.last_order_at ? (r.last_order_at instanceof Date ? r.last_order_at.toISOString() : String(r.last_order_at)) : null,
        };
      }
    } catch {}
  }
  return db.crmCustomers.find((c) => c.id === id);
};

export const getLeads = async (): Promise<LeadT[]> => {
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT id, customer_id, name, phone, email, source, stage, value, notes, created_at, updated_at, closed_at FROM leads ORDER BY updated_at DESC`;
      return (rows as any[]).map(r => ({
        id: r.id, customerId: r.customer_id, name: r.name, phone: r.phone, email: r.email || "", source: r.source, stage: r.stage as LeadStage, value: toNumber(r.value), notes: r.notes || "",
        createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
        updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
        closedAt: r.closed_at ? (r.closed_at instanceof Date ? r.closed_at.toISOString() : String(r.closed_at)) : null,
      }));
    } catch (e) { console.error("[store] getLeads Neon failed", e); }
  }
  return [...db.crmLeads].sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
};

export const getLead = async (id: string): Promise<LeadT | undefined> => {
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT id, customer_id, name, phone, email, source, stage, value, notes, created_at, updated_at, closed_at FROM leads WHERE id = ${id} LIMIT 1`;
      if (rows.length) {
        const r = rows[0] as any;
        return {
          id: r.id, customerId: r.customer_id, name: r.name, phone: r.phone, email: r.email || "", source: r.source, stage: r.stage as LeadStage, value: toNumber(r.value), notes: r.notes || "",
          createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
          updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
          closedAt: r.closed_at ? (r.closed_at instanceof Date ? r.closed_at.toISOString() : String(r.closed_at)) : null,
        };
      }
    } catch {}
  }
  return db.crmLeads.find((l) => l.id === id);
};

export const getLeadsByStage = async (): Promise<Map<LeadStage, LeadT[]>> => {
  const leads = await getLeads();
  const stages: LeadStage[] = ["LEAD", "CONTATO", "PROPOSTA", "NEGOCIACAO", "FECHADO_GANHO", "FECHADO_PERDIDO"];
  const map = new Map<LeadStage, LeadT[]>();
  for (const s of stages) map.set(s, []);
  for (const l of leads) map.get(l.stage)!.push(l);
  return map;
};

export const getCommunications = async (): Promise<CommunicationT[]> => {
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT id, customer_id, lead_id, order_id, type, direction, subject, notes, created_at FROM communications ORDER BY created_at DESC`;
      return (rows as any[]).map(r => ({
        id: r.id, customerId: r.customer_id, leadId: r.lead_id, orderId: r.order_id,
        type: r.type as CommType, direction: r.direction as CommDirection, subject: r.subject, notes: r.notes || "",
        createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      }));
    } catch (e) { console.error("[store] getCommunications Neon failed", e); }
  }
  return [...db.crmCommunications].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
};

export const getCommunicationsByCustomer = async (customerId: string): Promise<CommunicationT[]> => {
  const all = await getCommunications();
  return all.filter((c) => c.customerId === customerId);
};

export const getCommunicationsByLead = async (leadId: string): Promise<CommunicationT[]> => {
  const all = await getCommunications();
  return all.filter((c) => c.leadId === leadId);
};

// keep sync versions for client components that still call synchronously (fallback to memory)
export const getCommunicationsByLeadSync = (leadId: string): CommunicationT[] =>
  db.crmCommunications.filter((c) => c.leadId === leadId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

export async function getCRMStats() {
  const leads = await getLeads();
  const customers = await getCustomers();
  const comms = await getCommunications();
  const totalLeads = leads.length;
  const activeLeads = leads.filter((l) => !l.stage.startsWith("FECHADO")).length;
  const won = leads.filter((l) => l.stage === "FECHADO_GANHO").length;
  const lost = leads.filter((l) => l.stage === "FECHADO_PERDIDO").length;
  const closedTotal = won + lost;
  const conversionRate = closedTotal ? Math.round((won / closedTotal) * 100) : 0;
  const pipelineValue = leads.filter((l) => !l.stage.startsWith("FECHADO")).reduce((s, l) => s + l.value, 0);
  const wonValue = leads.filter((l) => l.stage === "FECHADO_GANHO").reduce((s, l) => s + l.value, 0);
  const totalCustomers = customers.length;
  const newCustomers30d = customers.filter((c) => withinDays(c.createdAt, 30)).length;
  const totalComms = comms.length;

  const stageValues: { stage: LeadStage; count: number; value: number }[] = [];
  const stages: LeadStage[] = ["LEAD", "CONTATO", "PROPOSTA", "NEGOCIACAO", "FECHADO_GANHO", "FECHADO_PERDIDO"];
  for (const s of stages) {
    const byStage = leads.filter((l) => l.stage === s);
    stageValues.push({ stage: s, count: byStage.length, value: byStage.reduce((sum, l) => sum + l.value, 0) });
  }

  const sourceMap = new Map<string, number>();
  for (const l of leads) sourceMap.set(l.source, (sourceMap.get(l.source) ?? 0) + 1);
  const sourceSplit = Array.from(sourceMap.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalLeads, activeLeads, won, lost, conversionRate,
    pipelineValue, wonValue, totalCustomers, newCustomers30d, totalComms,
    stageValues, sourceSplit,
  };
}

export type CRMStatsT = Awaited<ReturnType<typeof getCRMStats>>;
