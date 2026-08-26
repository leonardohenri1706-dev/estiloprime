import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Outfit, Space_Grotesk } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0c0d0e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://estiloprime.store"),
  title: "Estilo Prime | Moda Masculina & Streetwear — Itaiçaba - CE",
  description:
    "Estilo Prime (@estiloprime.store): Curadoria de Polos Tech, Oversized Streetwear e Bermudas de Linho em Itaiçaba-CE. Entrega Grátis na cidade e comanda direta no WhatsApp.",
  keywords: [
    "Estilo Prime",
    "Moda Masculina",
    "Streetwear Itaiçaba",
    "Polo Tech",
    "Camiseta Oversized",
    "Bermuda Linho",
    "Itaiçaba CE",
    "Estilo Prime Store",
  ],
  authors: [{ name: "Estilo Prime Store" }],
  openGraph: {
    title: "Estilo Prime | Moda Masculina & Streetwear",
    description:
      "Descubra a coleção de Polos Tech e Streetwear Oversized. Entrega Grátis em Itaiçaba-CE e pedido rápido no WhatsApp.",
    url: "https://estiloprime.store",
    siteName: "Estilo Prime Digital",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Estilo Prime Moda Masculina & Streetwear",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Estilo Prime | Moda Masculina & Streetwear",
    description:
      "Polos Tech e Streetwear Oversized com entrega grátis em Itaiçaba-CE.",
    images: ["https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${plusJakarta.variable} ${outfit.variable} ${spaceGrotesk.variable} dark`}>
      <body className="bg-[#0c0d0e] text-[#fafaf9] min-h-screen antialiased selection:bg-[#d97706] selection:text-black">
        {children}
      </body>
    </html>
  );
}
