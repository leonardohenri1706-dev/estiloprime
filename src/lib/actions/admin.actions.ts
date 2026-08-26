"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createHash, randomUUID } from "crypto";
import { db, getProduct, getZones } from "@/lib/db/store";
import { sql, isDbEnabled } from "@/lib/db/sql";
import { ADMIN_COOKIE, ADMIN_TOKEN } from "@/lib/admin/token";
import type { Category, OrderStatus, LeadStage } from "@/lib/db/store";
import {
  loginSchema, productSchema, stockUpdateSchema,
  orderStatusSchema, settingsSchema, deliveryZoneSchema,
  customerSchema, leadSchema, communicationSchema,
  type ProductInput, type SettingsInput, type DeliveryZoneInput,
  type CustomerInput, type LeadInput, type CommunicationInput,
} from "@/lib/schemas/admin.schema";


export async function assertAdmin() {
  const c = cookies();
  if (c.get(ADMIN_COOKIE)?.value !== ADMIN_TOKEN) throw new Error("Sessão expirada. Faça login novamente.");
}

export async function logoutAction() {
  cookies().delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

/* ---------------- produtos ---------------- */

export async function upsertProductAction(payload: ProductInput & { id?: string }) {
  await assertAdmin();
  const data = productSchema.parse(payload);
  const slugBase = data.name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  if (isDbEnabled() && sql) {
    try {
      if (payload.id) {
        // update
        const existing = await sql`SELECT id FROM products WHERE id = ${payload.id}`;
        if (!existing.length) throw new Error("Produto não encontrado");
        await sql`UPDATE products SET name=${data.name}, slug=${slugBase}, description=${data.description ?? ""}, price=${data.price}, old_price=${data.oldPrice ?? +(data.price * 1.25).toFixed(2)}, category=${data.category}, is_active=${data.isActive} WHERE id=${payload.id}`;
        // replace images
        await sql`DELETE FROM product_images WHERE product_id=${payload.id}`;
        for (let i = 0; i < data.images.length; i++) {
          await sql`INSERT INTO product_images (product_id, url, is_cover, sort_order) VALUES (${payload.id}, ${data.images[i]}, ${i===0}, ${i})`;
        }
        // replace variants
        await sql`DELETE FROM product_variants WHERE product_id=${payload.id}`;
        for (const v of data.variants) {
          await sql`INSERT INTO product_variants (product_id, size, stock) VALUES (${payload.id}, ${v.size}, ${v.stock})`;
        }
      } else {
        const id = randomUUID();
        await sql`INSERT INTO products (id, name, slug, description, price, old_price, category, is_active, created_at) VALUES (${id}, ${data.name}, ${slugBase}, ${data.description ?? ""}, ${data.price}, ${data.oldPrice ?? +(data.price * 1.25).toFixed(2)}, ${data.category}, ${data.isActive}, ${new Date().toISOString()})`;
        for (let i = 0; i < data.images.length; i++) {
          await sql`INSERT INTO product_images (product_id, url, is_cover, sort_order) VALUES (${id}, ${data.images[i]}, ${i===0}, ${i})`;
        }
        for (const v of data.variants) {
          await sql`INSERT INTO product_variants (product_id, size, stock) VALUES (${id}, ${v.size}, ${v.stock})`;
        }
      }
      revalidatePath("/admin/produtos");
      revalidatePath("/admin/dashboard");
      return { ok: true };
    } catch (e) {
      console.error("[upsertProduct] Neon failed, fallback to memory", e);
      // fallback to memory
    }
  }

  // fallback memory
  if (payload.id) {
    const p = await getProduct(payload.id);
    if (!p) throw new Error("Produto não encontrado");
    // for memory, we need to mutate db directly (sync)
    const mem = db.products.find(x => x.id === payload.id);
    if (!mem) throw new Error("Produto não encontrado");
    Object.assign(mem, {
      name: data.name, slug: slugBase, description: data.description ?? "",
      price: data.price, oldPrice: data.oldPrice ?? +(data.price * 1.25).toFixed(2),
      category: data.category as Category, isActive: data.isActive,
    });
    mem.images = data.images.map((url, i) => ({
      id: mem.images[i]?.id ?? randomUUID(), url, isCover: i === 0, order: i,
    }));
    for (const v of data.variants) {
      const ex = mem.variants.find((x) => x.size === v.size);
      if (ex) ex.stock = v.stock;
      else mem.variants.push({ id: randomUUID(), size: v.size, stock: v.stock });
    }
  } else {
    db.products.unshift({
      id: randomUUID(), createdAt: new Date().toISOString(),
      name: data.name, slug: slugBase, description: data.description ?? "",
      price: data.price, oldPrice: data.oldPrice ?? +(data.price * 1.25).toFixed(2),
      category: data.category as Category, isActive: data.isActive,
      images: data.images.map((url, i) => ({ id: randomUUID(), url, isCover: i === 0, order: i })),
      variants: data.variants.map((v) => ({ id: randomUUID(), size: v.size, stock: v.stock })),
    });
  }
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function updateVariantStockAction(productId: string, size: string, value: number) {
  await assertAdmin();
  const { size: s, value: v } = stockUpdateSchema.parse({ productId, size, value });
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT id FROM product_variants WHERE product_id=${productId} AND size=${s}`;
      if (!rows.length) throw new Error("Variação não encontrada");
      await sql`UPDATE product_variants SET stock=${v} WHERE product_id=${productId} AND size=${s}`;
      revalidatePath("/admin/produtos");
      revalidatePath("/admin/dashboard");
      return;
    } catch (e) { console.error("[updateVariantStock] Neon failed", e); }
  }
  const p = await getProduct(productId);
  const variant = (p as any)?.variants.find((x: any) => x.size === s);
  if (!variant) throw new Error("Variação não encontrada");
  // fallback memory
  const mem = db.products.find(x => x.id === productId)?.variants.find(x => x.size === s);
  if (mem) mem.stock = v;
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/dashboard");
}

export async function toggleProductActiveAction(id: string) {
  await assertAdmin();
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT is_active FROM products WHERE id=${id}`;
      if (!rows.length) throw new Error("Produto não encontrado");
      const cur = (rows[0] as any).is_active;
      await sql`UPDATE products SET is_active=${!cur} WHERE id=${id}`;
      revalidatePath("/admin/produtos");
      return;
    } catch (e) { console.error("[toggleActive] Neon failed", e); }
  }
  const p = await getProduct(id);
  if (!p) throw new Error("Produto não encontrado");
  const mem = db.products.find(x => x.id === id);
  if (mem) mem.isActive = !mem.isActive;
  revalidatePath("/admin/produtos");
}

export async function zerarGradeAction(id: string) {
  await assertAdmin();
  if (isDbEnabled() && sql) {
    try {
      await sql`UPDATE product_variants SET stock=0 WHERE product_id=${id}`;
      revalidatePath("/admin/produtos");
      revalidatePath("/admin/dashboard");
      return;
    } catch (e) { console.error("[zerarGrade] Neon failed", e); }
  }
  const p = await getProduct(id);
  if (!p) throw new Error("Produto não encontrado");
  const mem = db.products.find(x => x.id === id);
  if (mem) mem.variants.forEach((v) => (v.stock = 0));
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/dashboard");
}

export async function deleteProductAction(id: string) {
  await assertAdmin();
  if (isDbEnabled() && sql) {
    try {
      await sql`DELETE FROM products WHERE id=${id}`;
      revalidatePath("/admin/produtos");
      revalidatePath("/admin/dashboard");
      return;
    } catch (e) { console.error("[deleteProduct] Neon failed", e); }
  }
  db.products = db.products.filter((p) => p.id !== id);
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/dashboard");
}

/* ---------------- pedidos ---------------- */

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  await assertAdmin();
  const parsed = orderStatusSchema.parse({ orderId, status });
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT id FROM orders WHERE id=${parsed.orderId}`;
      if (!rows.length) throw new Error("Comanda não encontrada");
      await sql`UPDATE orders SET status=${parsed.status} WHERE id=${parsed.orderId}`;
      revalidatePath("/admin/pedidos");
      revalidatePath("/admin/dashboard");
      return;
    } catch (e) { console.error("[updateOrderStatus] Neon failed", e); }
  }
  const order = db.orders.find((o) => o.id === parsed.orderId);
  if (!order) throw new Error("Comanda não encontrada");
  order.status = parsed.status;
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/dashboard");
}

/* ---------------- configurações ---------------- */

export async function saveSettingsAction(payload: SettingsInput) {
  await assertAdmin();
  const d = settingsSchema.parse(payload);
  if (isDbEnabled() && sql) {
    try {
      await sql`UPDATE store_settings SET whatsapp_number=${d.whatsappNumber}, pix_key=${d.pixKey ?? ""}, pix_key_type=${d.pixKeyType ?? "CELULAR"}, pix_name=${d.pixName ?? ""}, free_delivery_enabled=${d.freeDeliveryEnabled ?? true}, pickup_enabled=${d.pickupEnabled ?? true}, payment_cash_enabled=${d.paymentCashEnabled ?? true}, payment_pix_enabled=${d.paymentPixEnabled ?? true}, payment_card_enabled=${d.paymentCardEnabled ?? false}, pix_qr_code=${d.pixQrCode ?? ""} WHERE id=1`;
      revalidatePath("/admin/configuracoes");
      return;
    } catch (e) { console.error("[saveSettings] Neon failed", e); }
  }
  Object.assign(db.settings, d);
  revalidatePath("/admin/configuracoes");
}

export async function saveZoneAction(id: string, payload: DeliveryZoneInput) {
  await assertAdmin();
  const d = deliveryZoneSchema.parse(payload);
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT id FROM delivery_zones WHERE id=${id}`;
      if (!rows.length) throw new Error("Zona não encontrada");
      await sql`UPDATE delivery_zones SET location=${d.location}, fee=${d.fee}, is_active=${d.isActive} WHERE id=${id}`;
      revalidatePath("/admin/configuracoes");
      return;
    } catch (e) { console.error("[saveZone] Neon failed", e); }
  }
  const z = (await getZones()).find((x) => x.id === id);
  if (!z) throw new Error("Zona não encontrada");
  // memory fallback: find in db.zones
  const mem = db.zones.find(x => x.id === id);
  if (mem) Object.assign(mem, d);
  revalidatePath("/admin/configuracoes");
}

export async function addZoneAction(payload: DeliveryZoneInput) {
  await assertAdmin();
  const d = deliveryZoneSchema.parse(payload);
  if (isDbEnabled() && sql) {
    try {
      await sql`INSERT INTO delivery_zones (location, fee, is_active) VALUES (${d.location}, ${d.fee}, ${d.isActive})`;
      revalidatePath("/admin/configuracoes");
      return;
    } catch (e) { console.error("[addZone] Neon failed", e); }
  }
  db.zones.push({ id: randomUUID(), ...d });
  revalidatePath("/admin/configuracoes");
}

export async function removeZoneAction(id: string) {
  await assertAdmin();
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT location FROM delivery_zones WHERE id=${id}`;
      if (!rows.length) throw new Error("Zona não encontrada");
      if (/itaiçaba|balcão/i.test((rows[0] as any).location)) throw new Error("Zonas padrão não podem ser removidas");
      await sql`DELETE FROM delivery_zones WHERE id=${id}`;
      revalidatePath("/admin/configuracoes");
      return;
    } catch (e) {
      if (String((e as Error).message).includes("Zonas padrão")) throw e;
      console.error("[removeZone] Neon failed", e);
    }
  }
  const z = (await getZones()).find((x) => x.id === id);
  if (!z) throw new Error("Zona não encontrada");
  if (/itaiçaba|balcão/i.test(z.location)) throw new Error("Zonas padrão não podem ser removidas");
  db.zones = db.zones.filter((x) => x.id !== id);
  revalidatePath("/admin/configuracoes");
}

export async function toggleZoneAction(id: string) {
  await assertAdmin();
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT is_active FROM delivery_zones WHERE id=${id}`;
      if (!rows.length) throw new Error("Zona não encontrada");
      await sql`UPDATE delivery_zones SET is_active=${!(rows[0] as any).is_active} WHERE id=${id}`;
      revalidatePath("/admin/configuracoes");
      return;
    } catch (e) { console.error("[toggleZone] Neon failed", e); }
  }
  const z = (await getZones()).find((x) => x.id === id);
  if (!z) throw new Error("Zona não encontrada");
  const mem = db.zones.find(x => x.id === id);
  if (mem) mem.isActive = !mem.isActive;
  revalidatePath("/admin/configuracoes");
}

/* ---------------- CRM: clientes ---------------- */

export async function createCustomerAction(payload: CustomerInput) {
  await assertAdmin();
  const data = customerSchema.parse(payload);
  if (isDbEnabled() && sql) {
    try {
      await sql`INSERT INTO customers (name, phone, email, cpf, address, city, notes, tags, total_orders, total_spent, last_order_at) VALUES (${data.name}, ${data.phone}, ${data.email ?? ""}, ${data.cpf ?? ""}, ${data.address ?? ""}, ${data.city ?? ""}, ${data.notes ?? ""}, ${JSON.stringify(data.tags ?? [])}::jsonb, 0, 0, null)`;
      revalidatePath("/admin/clientes");
      revalidatePath("/admin/dashboard");
      return { ok: true };
    } catch (e) { console.error("[createCustomer] Neon failed", e); }
  }
  db.crmCustomers.unshift({
    id: randomUUID(), createdAt: new Date().toISOString(),
    name: data.name, phone: data.phone, email: data.email ?? "",
    cpf: data.cpf ?? "", address: data.address ?? "", city: data.city ?? "",
    notes: data.notes ?? "", tags: data.tags ?? [],
    totalOrders: 0, totalSpent: 0, lastOrderAt: null,
  });
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function updateCustomerAction(id: string, payload: CustomerInput) {
  await assertAdmin();
  const data = customerSchema.parse(payload);
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT id FROM customers WHERE id=${id}`;
      if (!rows.length) throw new Error("Cliente não encontrado");
      await sql`UPDATE customers SET name=${data.name}, phone=${data.phone}, email=${data.email ?? ""}, cpf=${data.cpf ?? ""}, address=${data.address ?? ""}, city=${data.city ?? ""}, notes=${data.notes ?? ""}, tags=${JSON.stringify(data.tags ?? [])}::jsonb WHERE id=${id}`;
      revalidatePath("/admin/clientes");
      return { ok: true };
    } catch (e) { console.error("[updateCustomer] Neon failed", e); }
  }
  const c = db.crmCustomers.find((x) => x.id === id);
  if (!c) throw new Error("Cliente não encontrado");
  Object.assign(c, {
    name: data.name, phone: data.phone, email: data.email ?? "",
    cpf: data.cpf ?? "", address: data.address ?? "", city: data.city ?? "",
    notes: data.notes ?? "", tags: data.tags ?? [],
  });
  revalidatePath("/admin/clientes");
  return { ok: true };
}

export async function deleteCustomerAction(id: string) {
  await assertAdmin();
  if (isDbEnabled() && sql) {
    try {
      await sql`DELETE FROM customers WHERE id=${id}`;
      revalidatePath("/admin/clientes");
      revalidatePath("/admin/dashboard");
      return;
    } catch (e) { console.error("[deleteCustomer] Neon failed", e); }
  }
  db.crmCustomers = db.crmCustomers.filter((c) => c.id !== id);
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/dashboard");
}

/* ---------------- CRM: leads / pipeline ---------------- */

export async function createLeadAction(payload: LeadInput) {
  await assertAdmin();
  const data = leadSchema.parse(payload);
  if (isDbEnabled() && sql) {
    try {
      const now = new Date().toISOString();
      await sql`INSERT INTO leads (customer_id, name, phone, email, source, stage, value, notes, created_at, updated_at, closed_at) VALUES (${data.customerId ?? null}, ${data.name}, ${data.phone}, ${data.email ?? ""}, ${data.source}, ${data.stage}, ${data.value}, ${data.notes ?? ""}, ${now}, ${now}, null)`;
      revalidatePath("/admin/pipeline");
      revalidatePath("/admin/dashboard");
      return { ok: true };
    } catch (e) { console.error("[createLead] Neon failed", e); }
  }
  const now = new Date().toISOString();
  db.crmLeads.unshift({
    id: randomUUID(), customerId: data.customerId ?? null,
    name: data.name, phone: data.phone, email: data.email ?? "",
    source: data.source, stage: data.stage, value: data.value,
    notes: data.notes ?? "", createdAt: now, updatedAt: now, closedAt: null,
  });
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function updateLeadAction(id: string, payload: LeadInput) {
  await assertAdmin();
  const data = leadSchema.parse(payload);
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT closed_at FROM leads WHERE id=${id}`;
      if (!rows.length) throw new Error("Lead não encontrado");
      const closedAt = data.stage.startsWith("FECHADO") ? new Date().toISOString() : (rows[0] as any).closed_at;
      await sql`UPDATE leads SET customer_id=${data.customerId ?? null}, name=${data.name}, phone=${data.phone}, email=${data.email ?? ""}, source=${data.source}, stage=${data.stage}, value=${data.value}, notes=${data.notes ?? ""}, updated_at=${new Date().toISOString()}, closed_at=${closedAt} WHERE id=${id}`;
      revalidatePath("/admin/pipeline");
      revalidatePath("/admin/dashboard");
      return { ok: true };
    } catch (e) { console.error("[updateLead] Neon failed", e); }
  }
  const l = db.crmLeads.find((x) => x.id === id);
  if (!l) throw new Error("Lead não encontrado");
  Object.assign(l, {
    customerId: data.customerId ?? null, name: data.name, phone: data.phone,
    email: data.email ?? "", source: data.source, stage: data.stage,
    value: data.value, notes: data.notes ?? "", updatedAt: new Date().toISOString(),
    closedAt: data.stage.startsWith("FECHADO") ? new Date().toISOString() : l.closedAt,
  });
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/dashboard");
  return { ok: true };
}

export async function moveLeadAction(id: string, stage: LeadStage) {
  await assertAdmin();
  if (isDbEnabled() && sql) {
    try {
      const rows = await sql`SELECT id FROM leads WHERE id=${id}`;
      if (!rows.length) throw new Error("Lead não encontrado");
      const closed = stage.startsWith("FECHADO") ? new Date().toISOString() : null;
      if (closed) await sql`UPDATE leads SET stage=${stage}, updated_at=${new Date().toISOString()}, closed_at=${closed} WHERE id=${id}`;
      else await sql`UPDATE leads SET stage=${stage}, updated_at=${new Date().toISOString()} WHERE id=${id}`;
      revalidatePath("/admin/pipeline");
      revalidatePath("/admin/dashboard");
      return;
    } catch (e) { console.error("[moveLead] Neon failed", e); }
  }
  const l = db.crmLeads.find((x) => x.id === id);
  if (!l) throw new Error("Lead não encontrado");
  l.stage = stage;
  l.updatedAt = new Date().toISOString();
  if (stage.startsWith("FECHADO")) l.closedAt = new Date().toISOString();
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/dashboard");
}

export async function deleteLeadAction(id: string) {
  await assertAdmin();
  if (isDbEnabled() && sql) {
    try {
      await sql`DELETE FROM leads WHERE id=${id}`;
      revalidatePath("/admin/pipeline");
      revalidatePath("/admin/dashboard");
      return;
    } catch (e) { console.error("[deleteLead] Neon failed", e); }
  }
  db.crmLeads = db.crmLeads.filter((l) => l.id !== id);
  revalidatePath("/admin/pipeline");
  revalidatePath("/admin/dashboard");
}

export async function linkLeadToCustomerAction(leadId: string, customerId: string | null) {
  await assertAdmin();
  if (isDbEnabled() && sql) {
    try {
      await sql`UPDATE leads SET customer_id=${customerId}, updated_at=${new Date().toISOString()} WHERE id=${leadId}`;
      revalidatePath("/admin/pipeline");
      return;
    } catch (e) { console.error("[linkLead] Neon failed", e); }
  }
  const l = db.crmLeads.find((x) => x.id === leadId);
  if (!l) throw new Error("Lead não encontrado");
  l.customerId = customerId;
  l.updatedAt = new Date().toISOString();
  revalidatePath("/admin/pipeline");
}

/* ---------------- CRM: comunicações ---------------- */

export async function createCommunicationAction(payload: CommunicationInput) {
  await assertAdmin();
  const data = communicationSchema.parse(payload);
  if (isDbEnabled() && sql) {
    try {
      await sql`INSERT INTO communications (customer_id, lead_id, order_id, type, direction, subject, notes) VALUES (${data.customerId ?? null}, ${data.leadId ?? null}, ${data.orderId ?? null}, ${data.type}, ${data.direction}, ${data.subject}, ${data.notes ?? ""})`;
      revalidatePath("/admin/comunicacoes");
      revalidatePath("/admin/clientes");
      revalidatePath("/admin/pipeline");
      return { ok: true };
    } catch (e) { console.error("[createComm] Neon failed", e); }
  }
  db.crmCommunications.unshift({
    id: randomUUID(), customerId: data.customerId ?? null,
    leadId: data.leadId ?? null, orderId: data.orderId ?? null,
    type: data.type, direction: data.direction,
    subject: data.subject, notes: data.notes ?? "",
    createdAt: new Date().toISOString(),
  });
  revalidatePath("/admin/comunicacoes");
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/pipeline");
  return { ok: true };
}

export async function deleteCommunicationAction(id: string) {
  await assertAdmin();
  if (isDbEnabled() && sql) {
    try {
      await sql`DELETE FROM communications WHERE id=${id}`;
      revalidatePath("/admin/comunicacoes");
      return;
    } catch (e) { console.error("[deleteComm] Neon failed", e); }
  }
  db.crmCommunications = db.crmCommunications.filter((c) => c.id !== id);
  revalidatePath("/admin/comunicacoes");
}
