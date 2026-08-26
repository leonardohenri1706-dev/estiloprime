"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Gauge, Zap, Wind, ShieldAlert, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TelemetryHudProps {
  progress: number; // 0 to 1
}

export function TelemetryHud({ progress }: TelemetryHudProps) {
  // Telemetry mathematical simulation based on drift sequence
  // Sector 1 (0-0.25): Launch & acceleration (0 -> 180 km/h, 7500 RPM)
  // Sector 2 (0.25-0.55): Aggressive wet drift entry (180 -> 245 km/h, 8800 RPM, 1.78 G lateral)
  // Sector 3 (0.55-0.8): Downforce aero activation & exhaust flame (245 -> 290 km/h, 9100 RPM, rear torque 75%)
  // Sector 4 (0.8-1.0): Pit lane deceleration & status check (290 -> 45 km/h, 1200 RPM idle)

  let speed = 0;
  let rpm = 950;
  let gForce = 0.2;
  let driveMode = "STRADA";
  let tractionSlip = "NORMAL";
  let downforceKg = 180;
  let rearTorquePercent = 60;

  if (progress < 0.25) {
    const t = progress / 0.25;
    speed = Math.round(t * 185);
    rpm = Math.round(950 + t * 7400);
    gForce = Number((0.2 + t * 0.9).toFixed(2));
    driveMode = "SPORT";
    tractionSlip = t > 0.6 ? "SLIP 4.2%" : "OPTIMAL";
    downforceKg = Math.round(180 + t * 140);
    rearTorquePercent = Math.round(60 + t * 10);
  } else if (progress < 0.55) {
    const t = (progress - 0.25) / 0.3;
    speed = Math.round(185 + t * 65);
    rpm = Math.round(8350 + Math.sin(t * Math.PI) * 850);
    gForce = Number((1.1 + Math.sin(t * Math.PI) * 0.75).toFixed(2));
    driveMode = "CORSA / WET-PRO";
    tractionSlip = "ACTIVE DRIFT (12.4°)";
    downforceKg = Math.round(320 + t * 210);
    rearTorquePercent = 75;
  } else if (progress < 0.8) {
    const t = (progress - 0.55) / 0.25;
    speed = Math.round(250 + t * 52);
    rpm = Math.round(8900 + Math.sin(t * Math.PI * 2) * 300);
    gForce = Number((1.45 - t * 0.5).toFixed(2));
    driveMode = "ALA 2.0 ACTIVE";
    tractionSlip = "AERO PINNED";
    downforceKg = Math.round(530 + t * 240);
    rearTorquePercent = 70;
  } else {
    const t = (progress - 0.8) / 0.2;
    speed = Math.round(302 - t * 240);
    rpm = Math.round(9200 - t * 8100);
    gForce = Number((0.95 - t * 0.85).toFixed(2));
    driveMode = "PADDOCK READY";
    tractionSlip = "STABLE";
    downforceKg = Math.round(770 - t * 590);
    rearTorquePercent = 50;
  }

  // RPM percentage of 9,500 max
  const rpmPercent = Math.min(100, Math.round((rpm / 9500) * 100));

  return (
    <div className="flex flex-col gap-3 pointer-events-auto">
      {/* Top Telemetry Header */}
      <div className="glass-hud p-4 sm:p-5 border-l-4 border-l-giallo clip-angled relative overflow-hidden">
        {/* Decorative Grid and Accent Line */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-giallo/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between gap-4 mb-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-giallo animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-200">
              TELEMETRY BUS // LIVE
            </span>
          </div>
          <Badge variant="giallo" className="text-[10px]">
            {driveMode}
          </Badge>
        </div>

        {/* Speedometer & Tachometer Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 items-end">
          {/* Digital Speedometer */}
          <div>
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-giallo" />
              VELOCITY
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-mono text-3xl sm:text-5xl font-black text-white tracking-tighter tabular-nums text-glow-white">
                {String(speed).padStart(3, "0")}
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-giallo uppercase">
                KM/H
              </span>
            </div>
          </div>

          {/* RPM & Redline Bar */}
          <div>
            <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                V12 REVS
              </span>
              <span className="font-mono text-giallo tabular-nums text-xs font-bold">
                {rpm} RPM
              </span>
            </div>
            {/* Multi-segment Tachometer Gauge */}
            <div className="w-full h-3 bg-black/60 border border-white/15 p-0.5 mt-2 flex gap-0.5">
              {Array.from({ length: 20 }).map((_, i) => {
                const filled = (i + 1) * 5 <= rpmPercent;
                const isRedline = i >= 16;
                return (
                  <div
                    key={i}
                    className={cn(
                      "flex-1 h-full transition-all duration-75",
                      filled
                        ? isRedline
                          ? "bg-red-500 shadow-[0_0_6px_#ef4444]"
                          : "bg-giallo shadow-[0_0_4px_oklch(0.85_0.20_95)]"
                        : "bg-neutral-800/40"
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Secondary Telemetry Indicators */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
          {/* Lateral G-Force */}
          <div className="glass-card p-2 border border-white/10">
            <div className="text-[9px] font-mono text-neutral-400 uppercase">LATERAL G</div>
            <div className="font-mono text-sm sm:text-base font-bold text-white tabular-nums mt-0.5">
              {gForce} <span className="text-[10px] text-giallo">G</span>
            </div>
          </div>

          {/* Downforce */}
          <div className="glass-card p-2 border border-white/10">
            <div className="text-[9px] font-mono text-neutral-400 uppercase">DOWNFORCE</div>
            <div className="font-mono text-sm sm:text-base font-bold text-cyan-300 tabular-nums mt-0.5">
              {downforceKg} <span className="text-[10px] text-neutral-400">KG</span>
            </div>
          </div>

          {/* Torque Distribution */}
          <div className="glass-card p-2 border border-white/10">
            <div className="text-[9px] font-mono text-neutral-400 uppercase">AWD REAR BIAS</div>
            <div className="font-mono text-sm sm:text-base font-bold text-amber-400 tabular-nums mt-0.5">
              {rearTorquePercent}%
            </div>
          </div>
        </div>

        {/* Dynamic Wet Surface Warning Banner */}
        <div className="mt-3 flex items-center justify-between px-2.5 py-1.5 bg-cyan-950/40 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            WET SURFACE TELEMETRY:
          </span>
          <span className="font-bold text-cyan-200">{tractionSlip}</span>
        </div>
      </div>
    </div>
  );
}
