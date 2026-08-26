-- Estilo Prime — Neon Postgres Schema
-- idempotente: usa IF NOT EXISTS

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- admin
CREATE TABLE IF NOT EXISTS admin_users (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pass_hash TEXT NOT NULL
);

-- store_settings (single row id=1)
CREATE TABLE IF NOT EXISTS store_settings (
  id INT PRIMARY KEY CHECK (id = 1),
  whatsapp_number TEXT NOT NULL DEFAULT '5588999999999',
  pix_key TEXT NOT NULL DEFAULT '88999999999',
  pix_key_type TEXT NOT NULL DEFAULT 'CELULAR',
  pix_name TEXT NOT NULL DEFAULT 'Estilo Prime Store LTDA',
  free_delivery_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  pickup_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  payment_cash_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  payment_pix_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  payment_card_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  pix_qr_code TEXT NOT NULL DEFAULT ''
);

-- delivery_zones
CREATE TABLE IF NOT EXISTS delivery_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  old_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('POLOS','CAMISETAS','BERMUDAS','CONJUNTOS','ACESSORIOS')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- product_images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- product_variants
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL CHECK (size IN ('P','M','G','GG','38','40','42','44')),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0 AND stock <= 999)
);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);

-- customers (CRM)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  cpf TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_orders INT NOT NULL DEFAULT 0,
  total_spent NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_order_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_created ON customers(created_at);

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_type TEXT NOT NULL,
  delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING','PREPARING','DELIVERED','CANCELLED')),
  payment_method TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- order_items
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  price NUMERIC(10,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- leads (pipeline)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL DEFAULT '',
  source TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('LEAD','CONTATO','PROPOSTA','NEGOCIACAO','FECHADO_GANHO','FECHADO_PERDIDO')),
  value NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_customer ON leads(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_updated ON leads(updated_at);

-- communications
CREATE TABLE IF NOT EXISTS communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('WHATSAPP','TELEFONE','PRESENCIAL','EMAIL','INSTAGRAM')),
  direction TEXT NOT NULL CHECK (direction IN ('ENVIADA','RECEBIDA')),
  subject TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_comms_customer ON communications(customer_id);
CREATE INDEX IF NOT EXISTS idx_comms_lead ON communications(lead_id);
CREATE INDEX IF NOT EXISTS idx_comms_created ON communications(created_at);

-- hero_slides (site dinâmico)
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL,
  cta_text TEXT NOT NULL DEFAULT 'Ver coleção',
  cta_link TEXT NOT NULL DEFAULT '#catalogo',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- gallery_photos
CREATE TABLE IF NOT EXISTS gallery_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  photo_type TEXT NOT NULL DEFAULT 'EDITORIAL',
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- looks (lookbook)
CREATE TABLE IF NOT EXISTS looks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);
