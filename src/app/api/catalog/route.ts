import { NextResponse } from "next/server";
import { getProducts } from "@/lib/db/store";
import { LOOKS_FALLBACK } from "@/lib/db/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = (await getProducts())
    .filter((p) => p.isActive)
    .map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      oldPrice: Number(p.oldPrice ?? 0),
      category: p.category,
      images: p.images.map((i) => ({ url: i.url, isCover: i.isCover })),
      variants: p.variants.map((v) => ({ size: v.size, stock: v.stock })),
    }));

  return NextResponse.json(
    { products, looks: LOOKS_FALLBACK },
    { headers: { "Cache-Control": "no-store" } }
  );
}
