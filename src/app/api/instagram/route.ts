import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const USERNAME = "estiloprime.store";
const APP_ID = "936619743392459";
const TTL_MS = 10 * 60 * 1000;

interface CacheEntry { at: number; data: unknown }
const g = globalThis as unknown as { __igCache?: CacheEntry };

type IgPost = { id: string; url: string; thumb: string; caption: string };
type IgPayload = {
  ok: boolean;
  profile?: { username: string; fullName: string; avatar: string; followers: number };
  posts?: IgPost[];
};

async function fetchProfile(): Promise<IgPayload> {
  const endpoints = [
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${USERNAME}`,
    `https://i.instagram.com/api/v1/users/web_profile_info/?username=${USERNAME}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers: {
          "x-ig-app-id": APP_ID,
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
          accept: "*/*",
          "accept-language": "pt-BR,pt;q=0.9",
        },
        cache: "no-store",
      });
      if (!res.ok) continue;

      const json = (await res.json()) as {
        data?: {
          profile_pic_url_hd?: string;
          profile_pic_url?: string;
          full_name?: string;
          edge_followed_by?: { count?: number };
          edge_owner_to_timeline_media?: {
            edges?: { node: { id: string; shortcode: string; thumbnail_src?: string; display_url?: string; edge_media_to_caption?: { edges?: { node?: { text?: string } }[] } } }[];
          };
        };
      };
      const u = json?.data;
      if (!u) continue;

      const posts: IgPost[] = (u.edge_owner_to_timeline_media?.edges ?? [])
        .slice(0, 6)
        .map(({ node }) => ({
          id: node.shortcode || node.id,
          url: node.shortcode ? `https://www.instagram.com/p/${node.shortcode}/` : `https://www.instagram.com/${USERNAME}/`,
          thumb: node.thumbnail_src || node.display_url || "",
          caption: node.edge_media_to_caption?.edges?.[0]?.node?.text?.slice(0, 120) || "",
        }))
        .filter((p) => p.thumb);

      return {
        ok: true,
        profile: {
          username: USERNAME,
          fullName: u.full_name || "Estilo Prime Store",
          avatar: u.profile_pic_url_hd || u.profile_pic_url || "",
          followers: u.edge_followed_by?.count ?? 0,
        },
        posts,
      };
    } catch {
      continue;
    }
  }

  return { ok: false };
}

export async function GET() {
  const cached = g.__igCache;
  if (cached && Date.now() - cached.at < TTL_MS) {
    return NextResponse.json(cached.data, { headers: { "Cache-Control": "no-store" } });
  }

  const payload = await fetchProfile();
  if (payload.ok) g.__igCache = { at: Date.now(), data: payload };

  return NextResponse.json(payload, {
    status: payload.ok ? 200 : 200,
    headers: { "Cache-Control": "no-store" },
  });
}
