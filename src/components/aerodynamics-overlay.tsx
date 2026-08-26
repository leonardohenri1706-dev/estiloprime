"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Wind, Flame, Shield, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AerodynamicsOverlayProps {
  progress: number;
}

export function AerodynamicsOverlay({ progress }: AerodynamicsOverlayProps) {
  // Visible during sector 3 (0.50 to 0.80)
  const isVisible = progress >= 0.48 && progress <= 0.82;
  
  if (!isVisible) return null;

  // Calculate local fade
  let opacity = 1;
  if (progress < 0.55) {
    opacity = (progress - 0.48) / 0.07;
  } else if (progress > 0.75) {
    opacity = (0.82 - progress) / 0.07;
  }
  opacity = Math.max(0, Math.min(1, opacity));

  return (
    <div
      className="absolute top-24 right-6 sm:right-12 max-w-lg w-[calc(100%-3rem)] sm:w-[420px] pointer-events-none z-20 transition-all duration-300"
      style={{ opacity }}
    >
      <div className="glass-panel p-5 sm:p-6 border-r-4 border-r-giallo clip-corner-br relative pointer-events-auto">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
          <Badge variant="exhaust" className="text-xs">
            AERODINAMICA ATTIVA // ALA 2.0
          </Badge>
          <span className="font-mono text-xs text-giallo font-bold">
            DOWNFORCE +77%
          </span>
        </div>

        <h3 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-2">
          SURFACE VORTEX &amp; INCONEL FLAMES
        </h3>

        <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed mb-4">
          Under violent torrential braking and wet yaw angle rotation, the rear active wing
          elevates to High-Downforce configuration within 200ms. High-exit central exhausts
          energize the rear diffuser airflow to lock the rear axle at 1.85G lateral load.
        </p>

        {/* Technical Data Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="glass-card p-2.5 border border-white/10">
            <div className="text-[10px] text-neutral-400 uppercase">WING RESPONSE</div>
            <div className="text-white font-bold mt-0.5">&lt; 200 MS ACTUATION</div>
          </div>

          <div className="glass-card p-2.5 border border-white/10">
            <div className="text-[10px] text-neutral-400 uppercase">EXHAUST GAS VELOCITY</div>
            <div className="text-orange-400 font-bold mt-0.5">620 M/S @ PEAK</div>
          </div>

          <div className="glass-card p-2.5 border border-white/10">
            <div className="text-[10px] text-neutral-400 uppercase">REAR AXLE LOAD</div>
            <div className="text-cyan-300 font-bold mt-0.5">770 KG @ 280 KM/H</div>
          </div>

          <div className="glass-card p-2.5 border border-white/10">
            <div className="text-[10px] text-neutral-400 uppercase">TORQUE VECTORING</div>
            <div className="text-giallo font-bold mt-0.5">CORSA WET-LOCK</div>
          </div>
        </div>
      </div>
    </div>
  );
}
