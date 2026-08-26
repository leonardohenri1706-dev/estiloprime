import { NextResponse } from "next/server";
import { sql, isDbEnabled } from "@/lib/db/sql";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDbEnabled() || !sql) {
    // fallback: return empty, site will use hardcoded fallback
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const products = await sql`SELECT id, name, slug, description, price, old_price, category, is_active FROM products WHERE is_active = true ORDER BY created_at DESC`;
    const images = await sql`SELECT product_id, url, is_cover, sort_order FROM product_images ORDER BY sort_order`;
    const variants = await sql`SELECT product_id, size, stock FROM product_variants`;

    const imgMap = new Map<string, string>();
    for (const r of images as any[]) {
      if (r.is_cover) imgMap.set(r.product_id, r.url);
      if (!imgMap.has(r.product_id)) imgMap.set(r.product_id, r.url);
    }
    const stockMap = new Map<string, Record<string, number>>();
    const sizesMap = new Map<string, string[]>();
    for (const r of variants as any[]) {
      const rec = stockMap.get(r.product_id) || {};
      rec[r.size] = r.stock;
      stockMap.set(r.product_id, rec);
      const arr = sizesMap.get(r.product_id) || [];
      if (!arr.includes(r.size)) arr.push(r.size);
      sizesMap.set(r.product_id, arr);
    }

    const mapped = (products as any[]).map(r => ({
      id: r.id,
      name: r.name,
      category: r.category.toLowerCase(),
      price: String(r.price),
      old_price: String(r.old_price),
      badge: r.is_active ? "NOVO" : "",
      image: imgMap.get(r.id) || "",
      description: r.description,
      sizes: sizesMap.get(r.id) || ["P","M","G","GG"],
      stock: stockMap.get(r.id) || {},
    }));

    return NextResponse.json(mapped, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[api/products] error", e);
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
