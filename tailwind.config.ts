import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0c0d0e",
        foreground: "#fafaf9",
        prime: {
          dark: "#0c0d0e",
          card: "#121316",
          surface: "#18181b",
          surfaceLight: "#222328",
          amber: "#d97706",
          gold: "#f59e0b",
          goldLight: "#fbbf24",
          goldSoft: "#fef08a",
          muted: "#9ca3af",
          text: "#fafaf9",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Outfit", "sans-serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "sans-serif"],
        mono: ["var(--font-mono)", "Space Grotesk", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        "gold-glow": "0 0 25px -3px rgba(217, 119, 6, 0.5), 0 0 10px -2px rgba(251, 191, 36, 0.3)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
