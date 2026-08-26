import { NextResponse } from "next/server";

export async function GET() {
  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGrad" cx="80%" cy="20%" r="70%">
          <stop offset="0%" stop-color="#2a2405" />
          <stop offset="60%" stop-color="#0e1015" />
          <stop offset="100%" stop-color="#08090c" />
        </radialGradient>
        <linearGradient id="gialloGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FFD700" />
          <stop offset="100%" stop-color="#FF9500" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bgGrad)" />

      <!-- Top Header -->
      <g transform="translate(80, 60)">
        <polygon points="12,0 36,0 48,12 48,36 36,48 12,48 0,36 0,12" fill="#FFD700" />
        <text x="24" y="32" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="24" fill="#000000" text-anchor="middle">L</text>
        <text x="64" y="32" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="20" fill="#FFFFFF" letter-spacing="4">AUTOMOBILI LAMBORGHINI</text>
      </g>

      <!-- Title and Subtitles -->
      <text x="80" y="210" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="22" fill="#FFD700" letter-spacing="6">IMMERSIVE SCROLLYTELLING EXPERIENCE</text>
      <text x="80" y="290" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="76" fill="#FFFFFF" letter-spacing="-2">BEYOND THE STORM.</text>
      <text x="80" y="340" font-family="system-ui, -apple-system, sans-serif" font-size="22" fill="#94A3B8">1,015 CV V12 Hybrid • Active ALA 2.0 Aerodynamics • Real-Time Wet Telemetry</text>

      <!-- Bottom Metric Cards -->
      <g transform="translate(80, 430)">
        <!-- Line Separator -->
        <line x1="0" y1="0" x2="1040" y2="0" stroke="rgba(255,255,255,0.15)" stroke-width="1" />

        <g transform="translate(0, 35)">
          <text x="0" y="0" font-family="monospace" font-size="14" fill="#94A3B8">0-100 KM/H</text>
          <text x="0" y="35" font-family="monospace" font-weight="800" font-size="32" fill="#FFD700">2.5 SEC</text>
        </g>

        <g transform="translate(260, 35)">
          <text x="0" y="0" font-family="monospace" font-size="14" fill="#94A3B8">POWERTRAIN</text>
          <text x="0" y="35" font-family="monospace" font-weight="800" font-size="32" fill="#FFFFFF">1,015 CV</text>
        </g>

        <g transform="translate(520, 35)">
          <text x="0" y="0" font-family="monospace" font-size="14" fill="#94A3B8">V12 REDLINE</text>
          <text x="0" y="35" font-family="monospace" font-weight="800" font-size="32" fill="#FF9500">9,500 RPM</text>
        </g>

        <g transform="translate(780, 35)">
          <text x="0" y="0" font-family="monospace" font-size="14" fill="#94A3B8">ACTIVE DOWNFORCE</text>
          <text x="0" y="35" font-family="monospace" font-weight="800" font-size="32" fill="#38BDF8">+77% ALA 2.0</text>
        </g>
      </g>
    </svg>
  `;

  return new NextResponse(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
