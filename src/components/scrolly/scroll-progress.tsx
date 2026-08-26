"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Gauge, Zap, Flame, Flag } from "lucide-react";

interface ScrollProgressProps {
  progress: number; // 0 to 1
  onSectorClick?: (sectorIndex: number) => void;
}

const SECTORS = [
  { name: "REVEAL", subtitle: "Wet Launch", icon: Gauge, range: [0, 0.25] },
  { name: "TELEMETRY", subtitle: "Apex Drift", icon: Zap, range: [0.25, 0.55] },
  { name: "AERODYNAMICS", subtitle: "ALA 2.0 & Flame", icon: Flame, range: [0.55, 0.8] },
  { name: "TERMINAL", subtitle: "Bespoke Config", icon: Flag, range: [0.8, 1.0] },
];

export function ScrollProgress({ progress, onSectorClick }: ScrollProgressProps) {
  const percentage = Math.min(100, Math.max(0, Math.round(progress * 100)));

  // Current active sector index
  const currentSectorIndex = SECTORS.findIndex(
    (s) => progress >= s.range[0] && progress <= s.range[1]
  );
  const activeSector = SECTORS[currentSectorIndex >= 0 ? currentSectorIndex : 0];

  return (
    <div className="fixed top-0 left-0 right-0 z-40 pointer-events-none">
      {/* Top Thin Neon Progress Bar */}
      <div className="w-full h-1 bg-black/60 backdrop-blur-sm relative overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-giallo via-amber-300 to-exhaust-start shadow-[0_0_12px_oklch(0.85_0.20_95)] transition-all duration-75 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Persistent Top Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between pointer-events-auto">
        {/* Lamborghini DNA Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-giallo clip-hex-btn flex items-center justify-center font-display font-black text-black text-sm sm:text-base shadow-giallo-glow">
            L
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-black tracking-tighter text-sm sm:text-base uppercase text-white">
                LAMBORGHINI
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 bg-giallo/20 text-giallo border border-giallo/40 uppercase">
                STORM EDITION
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 font-mono tracking-widest hidden sm:block">
              SANT'AGATA BOLOGNESE • AERODINAMICA ATTIVA
            </p>
          </div>
        </div>

        {/* Sector Chapters Navigation */}
        <div className="hidden md:flex items-center gap-1.5 p-1 glass-card border border-white/10 rounded-none">
          {SECTORS.map((sector, idx) => {
            const isActive = currentSectorIndex === idx;
            const Icon = sector.icon;
            return (
              <button
                key={sector.name}
                onClick={() => onSectorClick?.(idx)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-xs font-mono tracking-wider transition-all duration-300 rounded-none",
                  isActive
                    ? "bg-giallo text-black font-extrabold shadow-giallo-glow"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 font-medium"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-black" : "text-neutral-400")} />
                <span>0{idx + 1} // {sector.name}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Track % Gauge */}
        <div className="flex items-center gap-3 glass-card px-3 py-1.5 border border-white/15">
          <div className="text-right">
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
              TRACK POSITION
            </div>
            <div className="font-mono text-sm sm:text-base font-bold text-giallo tabular-nums flex items-baseline justify-end gap-1">
              <span>{String(percentage).padStart(3, "0")}</span>
              <span className="text-[10px] text-neutral-400">%</span>
            </div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
        </div>
      </div>
    </div>
  );
}
