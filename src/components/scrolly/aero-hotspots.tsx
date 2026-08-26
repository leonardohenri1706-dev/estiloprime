"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Wind, Flame, Shield, Disc, ChevronRight, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Hotspot {
  id: string;
  name: string;
  category: string;
  position: { top: string; left: string };
  visibleRange: [number, number]; // scroll range [start, end]
  icon: React.ElementType;
  specs: { label: string; value: string }[];
  description: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "ala-front",
    name: "ALA 2.0 Active Front Flaps",
    category: "AERODYNAMICS",
    position: { top: "62%", left: "28%" },
    visibleRange: [0.15, 0.45],
    icon: Wind,
    specs: [
      { label: "Actuation Time", value: "< 500 ms" },
      { label: "Drag Reduction", value: "-35%" },
      { label: "Wet Channeling", value: "850 L/min" },
    ],
    description:
      "Electronically actuated front splitter flaps open in high-speed wet turns, diverting turbulent water spray away from the radiators while sustaining front axle downforce.",
  },
  {
    id: "brakes-ccmr",
    name: "CCMR Carbon-Ceramic Matrix",
    category: "BRAKING & GRIP",
    position: { top: "72%", left: "42%" },
    visibleRange: [0.25, 0.6],
    icon: Disc,
    specs: [
      { label: "Caliper Config", value: "10-Piston Monobloc" },
      { label: "Disc Diameter", value: "410 x 38 mm" },
      { label: "100-0 km/h Wet", value: "31.2 meters" },
    ],
    description:
      "Motorsport-grade Carbon-Ceramic discs with laser-etched rain dispersal micro-channels, preventing hydroplaning pad contact and maintaining instant thermal bite.",
  },
  {
    id: "active-wing",
    name: "Active Rear Aero Wing",
    category: "DOWNFORCE",
    position: { top: "35%", left: "75%" },
    visibleRange: [0.5, 0.85],
    icon: Shield,
    specs: [
      { label: "Max Downforce", value: "+77% vs SVJ" },
      { label: "Positions", value: "Low / High / Airbrake" },
      { label: "Lateral Grip", value: "1.85 G @ 240km/h" },
    ],
    description:
      "Continuous electro-hydraulic wing angling adapts to steering angle and yaw rate in milliseconds, counteracting wet oversteer during high-speed drifts.",
  },
  {
    id: "exhaust-flame",
    name: "Inconel Flame Channel & Diffuser",
    category: "POWERTRAIN",
    position: { top: "68%", left: "78%" },
    visibleRange: [0.55, 0.9],
    icon: Flame,
    specs: [
      { label: "Material", value: "Inconel 625 Titanium" },
      { label: "Peak Temp", value: "980 °C" },
      { label: "Exhaust Backpressure", value: "Zero Restrict" },
    ],
    description:
      "High-exit central exhaust system optimizes underbody airflow through the massive carbon diffuser, spitting unburnt fuel blue flames during aggressive gear downshifts.",
  },
];

interface AeroHotspotsProps {
  progress: number;
}

export function AeroHotspots({ progress }: AeroHotspotsProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // Filter visible hotspots for current scroll progress
  const visibleHotspots = HOTSPOTS.filter(
    (h) => progress >= h.visibleRange[0] && progress <= h.visibleRange[1]
  );

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      {/* Pulsating Target Markers */}
      {visibleHotspots.map((spot) => {
        const isSelected = selectedHotspot?.id === spot.id;
        const Icon = spot.icon;

        return (
          <div
            key={spot.id}
            className="absolute pointer-events-auto transition-all duration-500 -translate-x-1/2 -translate-y-1/2"
            style={{ top: spot.position.top, left: spot.position.left }}
          >
            <button
              onClick={() => setSelectedHotspot(isSelected ? null : spot)}
              className="relative group flex items-center justify-center p-3 cursor-pointer focus:outline-none"
            >
              {/* Radar Rings */}
              <span className="absolute w-12 h-12 rounded-full border border-giallo/60 animate-ping pointer-events-none" />
              <span className="absolute w-8 h-8 rounded-full bg-giallo/20 border border-giallo pointer-events-none group-hover:scale-125 transition-transform" />
              
              {/* Core Icon */}
              <div className="relative w-7 h-7 rounded-full bg-black border-2 border-giallo flex items-center justify-center text-giallo shadow-giallo-glow group-hover:bg-giallo group-hover:text-black transition-colors">
                <Icon className="w-3.5 h-3.5" />
              </div>

              {/* Hover Tag */}
              <div className="absolute left-full ml-3 px-2.5 py-1 glass-hud border border-giallo/40 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <p className="text-[10px] font-mono font-bold text-giallo uppercase tracking-wider">
                  {spot.name}
                </p>
              </div>
            </button>
          </div>
        );
      })}

      {/* Selected Hotspot Detail Card */}
      {selectedHotspot && (
        <div className="absolute bottom-24 left-6 sm:left-12 max-w-md w-[calc(100%-3rem)] sm:w-96 glass-panel border border-giallo/40 p-5 z-40 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <Badge variant="giallo" className="text-[10px] mb-1">
                {selectedHotspot.category}
              </Badge>
              <h4 className="text-base sm:text-lg font-display font-black text-white uppercase tracking-tight">
                {selectedHotspot.name}
              </h4>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="p-1 text-neutral-400 hover:text-white border border-white/10 hover:border-giallo/50 rounded-none transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-neutral-300 font-sans my-3 leading-relaxed">
            {selectedHotspot.description}
          </p>

          {/* Key Engineering Specs */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
            {selectedHotspot.specs.map((spec, i) => (
              <div key={i} className="glass-card p-2 text-center border border-white/5">
                <div className="text-[9px] font-mono text-neutral-400 uppercase">
                  {spec.label}
                </div>
                <div className="text-xs font-mono font-bold text-giallo mt-0.5">
                  {spec.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
