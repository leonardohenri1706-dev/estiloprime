"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ArrowRight, ShieldCheck, Flame, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroOverlayProps {
  progress: number;
  onExploreClick: () => void;
  onOpenBooking: () => void;
}

export function HeroOverlay({ progress, onExploreClick, onOpenBooking }: HeroOverlayProps) {
  // Fade out hero as user scrolls past 0.22
  const opacity = Math.max(0, 1 - progress / 0.18);
  const translateY = progress * 200;

  if (opacity <= 0.02) return null;

  return (
    <div
      className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-12 pointer-events-none transition-opacity duration-300"
      style={{
        opacity,
        transform: `translateY(-${translateY}px)`,
      }}
    >
      {/* Top Spacer for Nav */}
      <div className="h-12 sm:h-16" />

      {/* Main Hero Typography & Callout */}
      <div className="max-w-4xl">
        <div className="flex flex-wrap items-center gap-2.5 mb-4 pointer-events-auto">
          <Badge variant="giallo" className="text-xs">
            AUTOMOBILI LAMBORGHINI
          </Badge>
          <Badge variant="storm" className="text-xs">
            WET TRACK SCROLLYTELLING
          </Badge>
          <Badge variant="exhaust" className="text-xs">
            1015 CV V12 HPEV
          </Badge>
        </div>

        <h1 className="font-display text-4xl sm:text-7xl lg:text-8xl font-black text-white uppercase tracking-[-0.035em] leading-[0.9] text-glow-white mb-6">
          BEYOND <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-giallo via-amber-300 to-white text-glow-giallo">
            THE STORM.
          </span>
        </h1>

        <p className="max-w-xl text-neutral-300 text-sm sm:text-lg font-sans leading-relaxed mb-8 backdrop-blur-sm bg-black/30 p-4 border-l-2 border-l-giallo">
          Feel absolute control on drenched asphalt. Experience active aerodynamics,
          torque vectoring AWD, and 9,500 RPM naturally aspirated V12 acoustic fury
          synced to your scroll progression.
        </p>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pointer-events-auto">
          <Button
            variant="giallo"
            size="lg"
            onClick={onExploreClick}
            className="flex items-center gap-3"
          >
            <span>SCROLL TO PILOT</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </Button>

          <Button
            variant="glass"
            size="lg"
            onClick={onOpenBooking}
            className="flex items-center gap-2"
          >
            <span>VIP CONSULTATION</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Hero Metric Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl pointer-events-auto">
        <div className="glass-card p-3 border-l-2 border-l-giallo">
          <div className="text-[10px] font-mono text-neutral-400 uppercase">0-100 KM/H</div>
          <div className="font-mono text-xl sm:text-2xl font-black text-white tabular-nums">
            2.5 <span className="text-xs font-normal text-giallo">SEC</span>
          </div>
        </div>

        <div className="glass-card p-3 border-l-2 border-l-amber-400">
          <div className="text-[10px] font-mono text-neutral-400 uppercase">POWERTRAIN</div>
          <div className="font-mono text-xl sm:text-2xl font-black text-white tabular-nums">
            1,015 <span className="text-xs font-normal text-amber-400">CV</span>
          </div>
        </div>

        <div className="glass-card p-3 border-l-2 border-l-cyan-400">
          <div className="text-[10px] font-mono text-neutral-400 uppercase">AERODYNAMICS</div>
          <div className="font-mono text-xl sm:text-2xl font-black text-white tabular-nums">
            ALA 2.0 <span className="text-xs font-normal text-cyan-400">ACTIVE</span>
          </div>
        </div>

        <div className="glass-card p-3 border-l-2 border-l-red-500">
          <div className="text-[10px] font-mono text-neutral-400 uppercase">MAX SPEED</div>
          <div className="font-mono text-xl sm:text-2xl font-black text-white tabular-nums">
            &gt; 350 <span className="text-xs font-normal text-red-400">KM/H</span>
          </div>
        </div>
      </div>
    </div>
  );
}
