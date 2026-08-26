import { NextResponse } from "next/server";
import { sql, isDbEnabled } from "@/lib/db/sql";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isDbEnabled() || !sql) {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
  try {
    const rows = await sql`SELECT title, subtitle, image_url, cta_text, cta_link, display_order FROM hero_slides WHERE is_active = true ORDER BY display_order`;
    const mapped = (rows as any[]).map(r => ({
      badge: r.subtitle || "[ HERO ]",
      title: r.title,
      subtitle: r.subtitle,
      subtitle_class: "tx-serif acc",
      description: r.subtitle,
      cta_text: r.cta_text,
      piece_text: r.title,
      image_url: r.image_url,
    }));
    return NextResponse.json(mapped, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[api/hero-slides] error", e);
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
