import { NextResponse } from "next/server";
import { sql, isDbEnabled } from "@/lib/db/sql";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDbEnabled() || !sql) {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const rows = await sql`SELECT id, title, image_url, photo_type, display_order FROM gallery_photos WHERE is_active = true ORDER BY display_order`;
    const mapped = (rows as any[]).map(r => ({
      id: r.id,
      title: r.title,
      image: r.image_url,
      photo_type: r.photo_type,
      display_order: r.display_order,
    }));
    return NextResponse.json(mapped, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[api/gallery] error", e);
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
