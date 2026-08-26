const DJANGO_URL = process.env.DJANGO_API_URL || "http://localhost:8000";

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  subtitle_class: string;
  description: string;
  cta_text: string;
  cta_link: string;
  badge: string;
  piece_text: string;
  image_url: string;
  order: number;
  is_active: boolean;
}

export interface ProductImage {
  id: number;
  image: string;
  image_url: string;
  is_cover: boolean;
  order: number;
}

export interface ProductVariant {
  id: number;
  size: string;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  old_price: string | null;
  category: string;
  is_active: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  created_at: string;
}

export interface Look {
  id: number;
  tag: string;
  title: string;
  description: string;
  image_url: string;
  order: number;
}

export interface GalleryPhoto {
  id: number;
  title: string;
  image: string;
  description: string;
  tags: string;
  photo_type: string;
  order: number;
}

export interface StoreSetting {
  id: number;
  whatsapp_number: string;
  pix_key: string;
  pix_key_type: string;
  pix_name: string;
  free_delivery_enabled: boolean;
  pickup_enabled: boolean;
}

export interface DeliveryZone {
  id: number;
  location: string;
  fee: string;
  is_active: boolean;
}

async function fetchAPI<T>(endpoint: string, revalidate = 60): Promise<T> {
  try {
    const res = await fetch(`${DJANGO_URL}${endpoint}`, {
      next: { revalidate },
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  } catch {
    return [] as unknown as T;
  }
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  return fetchAPI<HeroSlide[]>("/api/hero-slides/", 300);
}

export async function getProducts(): Promise<Product[]> {
  return fetchAPI<Product[]>("/api/products/", 60);
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await fetchAPI<Product>(`/api/products/${slug}/`, 60);
  } catch {
    return null;
  }
}

export async function getLooks(): Promise<Look[]> {
  return fetchAPI<Look[]>("/api/looks/", 300);
}

export async function getGallery(): Promise<GalleryPhoto[]> {
  return fetchAPI<GalleryPhoto[]>("/api/gallery/", 300);
}

export async function getSettings(): Promise<StoreSetting | null> {
  try {
    return await fetchAPI<StoreSetting>("/api/settings/", 300);
  } catch {
    return null;
  }
}

export async function getZones(): Promise<DeliveryZone[]> {
  return fetchAPI<DeliveryZone[]>("/api/delivery-zones/", 300);
}
