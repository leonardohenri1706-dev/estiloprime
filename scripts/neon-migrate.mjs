import { readFile } from "fs/promises";
import { neon } from "@neondatabase/serverless";
import { randomUUID, createHash } from "crypto";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}
const sql = neon(url);

async function migrate() {
  console.log("→ Running schema.sql...");
  let schema = await readFile(new URL("../src/lib/db/schema.sql", import.meta.url), "utf8");
  // remove comment lines
  schema = schema.split("\n").filter(l => !l.trim().startsWith("--")).join("\n");
  const statements = schema
    .split(";")
    .map(s => s.trim())
    .filter(s => s && s.length > 10);

  for (const stmt of statements) {
    const trimmed = stmt.trim();
    if (!trimmed) continue;
    try {
      if (typeof sql.unsafe === "function") {
        await sql.unsafe(trimmed);
      } else {
        await sql(trimmed);
      }
    } catch (e) {
      if (String(e.message).includes("already exists")) {
        console.log("  (skip already exists)");
        continue;
      }
      console.error("  ✗ statement failed:", trimmed.slice(0, 120), e.message);
      throw e;
    }
  }
  console.log("✓ Schema ready");
}

async function seed() {
  console.log("→ Checking existing data...");
  const [{ count: prodCount }] = await sql`SELECT COUNT(*)::int as count FROM products`;
  if (prodCount > 0) {
    console.log(`  products already seeded (${prodCount}), skipping seed`);
    return;
  }
  console.log("→ Seeding database (empty, inserting)...");

  const sha = (s) => createHash("sha256").update(s).digest("hex");
  const daysAgo = (n, hour = 12) => {
    const d = new Date(); d.setDate(d.getDate() - n); d.setHours(hour, (n * 7) % 60, 0, 0);
    return d.toISOString();
  };
  const img = (seed) => `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=900&q=85`;

  // admin
  await sql`INSERT INTO admin_users (email, name, pass_hash) VALUES ('admin@estiloprime.store', 'Lojista Prime', ${sha("prime2026")}) ON CONFLICT (email) DO NOTHING`;
  console.log("  admin seeded");

  // settings
  await sql`INSERT INTO store_settings (id, whatsapp_number, pix_key, pix_key_type, pix_name, free_delivery_enabled, pickup_enabled, payment_cash_enabled, payment_pix_enabled, payment_card_enabled, pix_qr_code)
    VALUES (1, '5588999999999', '88999999999', 'CELULAR', 'Estilo Prime Store LTDA', true, true, true, true, false, '')
    ON CONFLICT (id) DO NOTHING`;
  console.log("  settings seeded");

  // zones
  const zones = [
    ["Itaiçaba (Local)", 0, true],
    ["Retirada no Balcão", 0, true],
    ["Jaguaruana", 10, true],
    ["Palhano", 8, true],
    ["Russas", 20, true],
    ["Aracati", 15, false],
  ];
  for (const [loc, fee, active] of zones) {
    await sql`INSERT INTO delivery_zones (location, fee, is_active) VALUES (${loc}, ${fee}, ${active})`;
  }
  console.log("  zones seeded");

  // products
  const productsData = [
    { name: "Polo Tech Black Zíper Masculina", slug: "polo-tech-black-ziper", desc: "Malha estruturada com elastano e tecnologia anti-suor. Zíper frontal inoxidável.", price: 89.9, oldPrice: 119.9, cat: "POLOS", active: true, seeds: ["1620799140408-edc6dcb6d633"], stocks: { P: 3, M: 6, G: 1, GG: 2 } },
    { name: "Camiseta Oversized Vintage Black", slug: "oversized-vintage-black", desc: "Boxy cut, ombro caído e gola grossa 3cm. Algodão penteado 240g/m².", price: 79.9, oldPrice: 99.9, cat: "CAMISETAS", active: true, seeds: ["1574180566232-aaad1b5b8450", "1576566588028-4147f3842f27"], stocks: { P: 5, M: 8, G: 7, GG: 3 } },
    { name: "Polo Tech Sand Areia Zíper", slug: "polo-tech-sand-areia", desc: "Tom areia nobre com acabamento acetinado.", price: 89.9, oldPrice: 119.9, cat: "POLOS", active: true, seeds: ["1594938298603-c8148c4dae35"], stocks: { P: 2, M: 5, G: 3, GG: 1 } },
    { name: "Bermuda Linho Areia Alfaiataria", slug: "bermuda-linho-areia", desc: "Linho misto com corte acima do joelho e cós com cordão de ajuste.", price: 79.9, oldPrice: 109.9, cat: "BERMUDAS", active: true, seeds: ["1562247879-0eac107b7e76"], stocks: { P: 0, M: 5, G: 4, GG: 2 } },
    { name: "Slim Fit Algodão Off-White", slug: "slim-fit-off-white", desc: "Fio 30.1 penteado com toque peletizado.", price: 59.9, oldPrice: 79.9, cat: "CAMISETAS", active: true, seeds: ["1489987707025-afc232f7ea0f"], stocks: { P: 4, M: 6, G: 5, GG: 3 } },
    { name: "Oversized Acid Wash Heavyweight", slug: "oversized-acid-wash", desc: "Lavagem mineral acid wash exclusiva da Estilo Prime.", price: 84.9, oldPrice: 110, cat: "CAMISETAS", active: false, seeds: ["1598033129183-c4f50c736f10"], stocks: { P: 2, M: 4, G: 3, GG: 1 } },
    { name: "Conjunto Polo Tech + Bermuda Linho", slug: "conjunto-polo-linho", desc: "Look completo smart casual para o clima cearense.", price: 149.9, oldPrice: 189.9, cat: "CONJUNTOS", active: true, seeds: ["1552374196-1ab2a1c593e8"], stocks: { P: 2, M: 3, G: 2, GG: 1 } },
    { name: "Boné Dad Hat Minimalist EP", slug: "bone-dad-hat-ep", desc: "Sarja peletizada com bordado do monograma EP.", price: 49.9, oldPrice: 69.9, cat: "ACESSORIOS", active: true, seeds: ["1516826957135-700dedea698c"], stocks: { P: 10, M: 10, G: 8, GG: 0 } },
  ];

  const productIds = [];
  for (const p of productsData) {
    const id = randomUUID();
    productIds.push({ id, ...p });
    await sql`INSERT INTO products (id, name, slug, description, price, old_price, category, is_active, created_at)
      VALUES (${id}, ${p.name}, ${p.slug}, ${p.desc}, ${p.price}, ${p.oldPrice}, ${p.cat}, ${p.active}, ${daysAgo(40)})`;
    // images
    for (let i = 0; i < p.seeds.length; i++) {
      await sql`INSERT INTO product_images (product_id, url, is_cover, sort_order) VALUES (${id}, ${img(p.seeds[i])}, ${i===0}, ${i})`;
    }
    // variants
    for (const size of ["P","M","G","GG"]) {
      const stock = p.stocks[size] ?? 4;
      await sql`INSERT INTO product_variants (product_id, size, stock) VALUES (${id}, ${size}, ${stock})`;
    }
  }
  console.log("  products seeded (8)");

  // customers
  const customers = [
    { name: "Carlos Eduardo", phone: "88998123456", email: "carlos@email.com", cpf: "000.111.222-33", address: "Rua das Flores, 120", city: "Itaiçaba", notes: "Cliente fiel, compra todo mês", tags: ["VIP","Fiel"], totalOrders:5, totalSpent:689.50, last: daysAgo(2), created: daysAgo(60) },
    { name: "Rafael Lima", phone: "88997456123", email: "rafael@email.com", cpf: "111.222.333-44", address: "Av. Principal, 450", city: "Jaguaruana", notes: "Indicado pelo Carlos", tags: ["Indicação"], totalOrders:3, totalSpent:329.70, last: daysAgo(8), created: daysAgo(45) },
    { name: "João Pedro", phone: "88996111222", email: "joao@email.com", cpf: "", address: "Rua do Sol, 78", city: "Russas", notes: "Compra presentes para namorada", tags: [], totalOrders:2, totalSpent:179.80, last: daysAgo(12), created: daysAgo(30) },
    { name: "Matheus Souza", phone: "88993334444", email: "matheus@email.com", cpf: "333.444.555-66", address: "Rua da Paz, 310", city: "Palhano", notes: "Prefere polos tech", tags: ["Atacado"], totalOrders:8, totalSpent:1245.00, last: daysAgo(1), created: daysAgo(90) },
    { name: "Lucas Andrade", phone: "88995556666", email: "", cpf: "", address: "", city: "Itaiçaba", notes: "Retira no balcão sempre", tags: ["Balcão"], totalOrders:4, totalSpent:359.60, last: daysAgo(5), created: daysAgo(15) },
    { name: "Felipe Castro", phone: "88997778888", email: "felipe@email.com", cpf: "555.666.777-88", address: "Rua Nova, 90", city: "Itaiçaba", notes: "", tags: [], totalOrders:1, totalSpent:89.90, last: daysAgo(10), created: daysAgo(10) },
    { name: "Bruno Rocha", phone: "88991239876", email: "bruno@email.com", cpf: "", address: "Av. Beira Mar, 200", city: "Aracati", notes: "Cliente de praia, gosta de bermudas", tags: [], totalOrders:2, totalSpent:159.80, last: daysAgo(3), created: daysAgo(7) },
    { name: "Diego Martins", phone: "88999887766", email: "", cpf: "", address: "", city: "Russas", notes: "Novo cliente, veio do Instagram", tags: ["Instagram"], totalOrders:1, totalSpent:79.90, last: daysAgo(3), created: daysAgo(3) },
    { name: "Gabriel Costa", phone: "88991112233", email: "gabriel@email.com", cpf: "777.888.999-00", address: "Rua do Comércio, 55", city: "Jaguaruana", notes: "Compra para revenda", tags: ["Atacado","VIP"], totalOrders:12, totalSpent:2890.00, last: daysAgo(4), created: daysAgo(120) },
    { name: "Thiago Almeida", phone: "88994445566", email: "thiago@email.com", cpf: "", address: "", city: "Palhano", notes: "Indicado pelo Matheus", tags: ["Indicação"], totalOrders:2, totalSpent:169.80, last: daysAgo(6), created: daysAgo(20) },
    { name: "Pedro Henrique", phone: "88996667788", email: "", cpf: "", address: "Rua das Acácias, 12", city: "Itaiçaba", notes: "Estudante, gosta de camisetas", tags: [], totalOrders:1, totalSpent:59.90, last: daysAgo(5), created: daysAgo(5) },
    { name: "Marcos Vinícius", phone: "88992223344", email: "marcos@email.com", cpf: "222.333.444-55", address: "Rua do Portão, 88", city: "Russas", notes: "Prefere entrega em casa", tags: [], totalOrders:3, totalSpent:269.70, last: daysAgo(9), created: daysAgo(40) },
  ];
  const customerIds = [];
  for (const c of customers) {
    const id = randomUUID();
    customerIds.push(id);
    await sql`INSERT INTO customers (id, name, phone, email, cpf, address, city, notes, tags, created_at, total_orders, total_spent, last_order_at)
      VALUES (${id}, ${c.name}, ${c.phone}, ${c.email}, ${c.cpf}, ${c.address}, ${c.city}, ${c.notes}, ${JSON.stringify(c.tags)}::jsonb, ${c.created}, ${c.totalOrders}, ${c.totalSpent}, ${c.last})`;
  }
  console.log("  customers seeded (12)");

  // fetch product variants for orders
  const variants = await sql`SELECT id, product_id, size FROM product_variants LIMIT 20`;
  const zonesDb = await sql`SELECT location, fee FROM delivery_zones WHERE is_active = true`;

  // orders (16)
  const CUSTOMERS_TUP = [["Carlos Eduardo","88998123456"],["Rafael Lima","88997456123"],["João Pedro","88996111222"],["Matheus Souza","88993334444"],["Lucas Andrade","88995556666"],["Felipe Castro","88997778888"],["Bruno Rocha","88991239876"],["Diego Martins","88999887766"]];
  const statuses = ["DELIVERED","DELIVERED","DELIVERED","DELIVERED","DELIVERED","DELIVERED","PREPARING","PREPARING","PENDING","PENDING","PENDING","DELIVERED","CANCELLED","DELIVERED","PREPARING","DELIVERED"];
  for (let i=0; i<statuses.length; i++) {
    const prod = productIds[i % productIds.length];
    const variant = variants[i % variants.length];
    const qty = 1 + (i % 2);
    const zone = zonesDb[i % zonesDb.length] || { location: "Retirada no Balcão", fee: 0 };
    const [name, phone] = CUSTOMERS_TUP[i % CUSTOMERS_TUP.length];
    const sub = prod.price * qty;
    const total = +(sub + Number(zone.fee)).toFixed(2);
    const orderId = randomUUID();
    const orderNumber = `EP-${1042+i}`;
    await sql`INSERT INTO orders (id, order_number, customer_name, customer_phone, delivery_type, delivery_fee, total_amount, status, created_at)
      VALUES (${orderId}, ${orderNumber}, ${name}, ${phone}, ${zone.location}, ${zone.fee}, ${total}, ${statuses[i]}, ${daysAgo(29 - Math.round((i/statuses.length)*28), 10+(i%8))})`;
    await sql`INSERT INTO order_items (order_id, variant_id, product_name, size, quantity, price)
      VALUES (${orderId}, ${variant.id}, ${prod.name}, ${variant.size}, ${qty}, ${prod.price})`;
  }
  console.log("  orders seeded (16)");

  // leads
  const stages = ["LEAD","CONTATO","PROPOSTA","NEGOCIACAO","FECHADO_GANHO","FECHADO_PERDIDO"];
  const sources = ["WhatsApp","Instagram","Indicação","Balcão","Site"];
  const leadData = [
    { name: "Ana Beatriz", phone: "88990001122", email: "ana@email.com", source: "Instagram", stage: "LEAD", value: 200, notes: "Interessada em conjunto polo+bermuda", days:2, custIdx:null },
    { name: "Carlos Eduardo", phone: "88998123456", email: "carlos@email.com", source: "WhatsApp", stage: "NEGOCIACAO", value: 450, notes: "Quer 3 polos para presente", days:5, custIdx:0 },
    { name: "Rafael Lima", phone: "88997456123", email: "rafael@email.com", source: "Indicação", stage: "PROPOSTA", value: 180, notes: "Indicado pelo Carlos, interessado em camisetas", days:8, custIdx:1 },
    { name: "Fernanda Dias", phone: "88993330011", email: "fernanda@email.com", source: "WhatsApp", stage: "CONTATO", value: 320, notes: "Compra para marido, pediu catálogo", days:3, custIdx:null },
    { name: "Lucas Andrade", phone: "88995556666", email: "", source: "Balcão", stage: "FECHADO_GANHO", value: 359.60, notes: "Comprou 4 vezes, sempre retira no balcão", days:15, custIdx:4 },
    { name: "João Vitor", phone: "88997770088", email: "jv@email.com", source: "Site", stage: "LEAD", value: 100, notes: "Preencheu formulário VIP", days:1, custIdx:null },
    { name: "Matheus Souza", phone: "88993334444", email: "matheus@email.com", source: "WhatsApp", stage: "FECHADO_GANHO", value: 1245, notes: "Maior comprador atacadista", days:30, custIdx:3 },
    { name: "Camila Santos", phone: "88998887766", email: "camila@email.com", source: "Instagram", stage: "PROPOSTA", value: 280, notes: "Viu look no feed, quer mesmo conjunto", days:4, custIdx:null },
    { name: "Bruno Rocha", phone: "88991239876", email: "bruno@email.com", source: "Indicação", stage: "NEGOCIACAO", value: 160, notes: "Quer bermudas de linho", days:7, custIdx:6 },
    { name: "Gabriel Costa", phone: "88991112233", email: "gabriel@email.com", source: "WhatsApp", stage: "FECHADO_GANHO", value: 2890, notes: "Revendedor atacadista recorrente", days:45, custIdx:8 },
    { name: "Renata Oliveira", phone: "88992220033", email: "", source: "Balcão", stage: "CONTATO", value: 150, notes: "Passou na loja, pegou cartão", days:6, custIdx:null },
    { name: "Thiago Almeida", phone: "88994445566", email: "thiago@email.com", source: "Indicação", stage: "FECHADO_PERDIDO", value: 200, notes: "Desistiu por preço", days:18, custIdx:9 },
  ];
  const leadIds = [];
  for (const l of leadData) {
    const id = randomUUID();
    leadIds.push(id);
    const custId = l.custIdx !== null ? customerIds[l.custIdx] : null;
    const closed = l.stage.startsWith("FECHADO") ? daysAgo(Math.max(0,l.days-1)) : null;
    await sql`INSERT INTO leads (id, customer_id, name, phone, email, source, stage, value, notes, created_at, updated_at, closed_at)
      VALUES (${id}, ${custId}, ${l.name}, ${l.phone}, ${l.email}, ${l.source}, ${l.stage}, ${l.value}, ${l.notes}, ${daysAgo(l.days)}, ${daysAgo(Math.max(0,l.days-2))}, ${closed})`;
  }
  console.log("  leads seeded (12)");

  // communications
  const commTypes = ["WHATSAPP","TELEFONE","PRESENCIAL","EMAIL","INSTAGRAM"];
  const dirs = ["ENVIADA","RECEBIDA"];
  const subjects = ["Saudação inicial","Envio de catálogo","Follow-up proposta","Confirmação de pedido","Dúvida sobre tamanho","Agradecimento pela compra","Retorno sobre entrega","Nova coleção disponível","Convite para evento","Resolver problema troca"];
  const ordersForComm = await sql`SELECT id FROM orders LIMIT 6`;
  for (let i=0; i<24; i++) {
    const catId = i < customerIds.length ? customerIds[i % customerIds.length] : null;
    const leadId = i % 3 === 0 ? leadIds[i % leadIds.length] : null;
    const orderId = i < ordersForComm.length ? ordersForComm[i].id : null;
    await sql`INSERT INTO communications (customer_id, lead_id, order_id, type, direction, subject, notes, created_at)
      VALUES (${catId}, ${leadId}, ${orderId}, ${commTypes[i%commTypes.length]}, ${dirs[i%2]}, ${subjects[i%subjects.length]}, ${`Registro de interação ${i+1}`}, ${daysAgo(23 - Math.floor(i*0.9))})`;
  }
  console.log("  communications seeded (24)");

  // hero slides (optional)
  const slides = [
    ["CAMISETAS OVERSIZED Boxy Cut","Algodão 240g/m²","https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?auto=format&fit=crop&w=2400&q=90"],
    ["CAMISAS DE TIME Game Day","Jersey retrô","https://images.unsplash.com/photo-1759308553457-6f7f0850d9cd?auto=format&fit=crop&w=2400&q=90"],
  ];
  for (let i=0; i<slides.length; i++) {
    await sql`INSERT INTO hero_slides (title, subtitle, image_url, display_order, is_active) VALUES (${slides[i][0]}, ${slides[i][1]}, ${slides[i][2]}, ${i}, true)`;
  }

  // gallery
  const gallerySeeds = ["1620799140408-edc6dcb6d633","1574180566232-aaad1b5b8450","1562247879-0eac107b7e76","1620799139507-3c5a2d50671d"];
  for (let i=0; i<gallerySeeds.length; i++) {
    await sql`INSERT INTO gallery_photos (title, image_url, photo_type, display_order, is_active) VALUES (${'Foto '+(i+1)}, ${`https://images.unsplash.com/photo-${gallerySeeds[i]}?auto=format&fit=crop&w=900&q=85`}, 'EDITORIAL', ${i}, true)`;
  }

  // looks
  const lookSeeds = ["1574180566232-aaad1b5b8450","1620799140408-edc6dcb6d633","1562247879-0eac107b7e76"];
  for (let i=0; i<lookSeeds.length; i++) {
    await sql`INSERT INTO looks (title, image_url, display_order, is_active) VALUES (${'Look '+(i+1)}, ${`https://images.unsplash.com/photo-${lookSeeds[i]}?auto=format&fit=crop&w=900&q=85`}, ${i}, true)`;
  }

  console.log("✓ Seeding complete");
}

migrate().then(seed).then(()=>{console.log("Done"); process.exit(0)}).catch(e=>{console.error("Failed",e); process.exit(1)});
