"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  Calendar,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Cpu,
  Flame,
  Zap,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ConversionTerminalProps {
  progress: number;
  onOpenBooking: () => void;
  onRestart: () => void;
}

const SPEC_SECTIONS = [
  {
    title: "V12 HYBRID ENGINE & PERFORMANCE",
    icon: Zap,
    specs: [
      { label: "Internal Combustion Engine", value: "6.5L Naturally Aspirated V12 (L545)" },
      { label: "Electric Powertrain", value: "3 Axial Flux Electric Motors (148 CV each)" },
      { label: "Combined Output", value: "1,015 CV (746 kW) @ 9,250 RPM" },
      { label: "Max Engine Speed", value: "9,500 RPM Redline" },
      { label: "0-100 km/h (0-62 mph)", value: "2.5 seconds (Wet Surface Launch)" },
      { label: "Top Speed", value: "> 350 km/h (> 217 mph)" },
    ],
  },
  {
    title: "CHASSIS & ACTIVE AERODYNAMICS",
    icon: Shield,
    specs: [
      { label: "Chassis Monocoque", value: "Monofuselage Multi-Technology Carbon Fiber" },
      { label: "Aero System", value: "ALA 2.0 Active Aero Vectoring & Integrated Diffuser" },
      { label: "Downforce Increase", value: "+61% Front / +77% Rear vs Aventador SVJ" },
      { label: "Braking System", value: "Carbon-Ceramic CCMR (410x38mm 10-piston front)" },
      { label: "Dry Weight", value: "1,772 kg (Weight-to-Power: 1.75 kg/CV)" },
    ],
  },
  {
    title: "WET DYNAMICS & DRIVE MODES",
    icon: Cpu,
    specs: [
      { label: "All-Wheel Drive", value: "Electric Torque Vectoring Front + Mechanical Rear" },
      { label: "Drive Modes (13 Options)", value: "Recharge, Hybrid, Performance x Corsa/Strada/Wet" },
      { label: "Tires", value: "Bespoke Bridgestone Potenza Sport / Wet Trofeo R" },
      { label: "Traction Electronics", value: "Lamborghini Dinamica Veicolo 2.0 (LDV 2.0)" },
    ],
  },
];

export function ConversionTerminal({
  progress,
  onOpenBooking,
  onRestart,
}: ConversionTerminalProps) {
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);

  const isVisible = progress >= 0.78;
  if (!isVisible) return null;

  const opacity = Math.min(1, (progress - 0.78) / 0.12);

  return (
    <div
      className="relative z-30 min-h-screen max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-24 flex flex-col justify-center transition-all duration-500"
      style={{ opacity }}
    >
      {/* Terminal Main Banner Card */}
      <div className="glass-panel p-6 sm:p-10 border-2 border-giallo/50 shadow-2xl relative overflow-hidden clip-angled">
        {/* Background Carbon and Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-giallo/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-exhaust-start/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Badge variant="giallo" className="text-xs">
              OFFICIAL TERMINAL // SANT'AGATA BOLOGNESE
            </Badge>
            <Badge variant="active" className="text-xs hidden sm:inline-flex">
              ALLOCATIONS OPEN
            </Badge>
          </div>
          <span className="font-mono text-xs text-neutral-400">
            EXPERIENCE COMPLETION: 100%
          </span>
        </div>

        {/* Title and Pitch */}
        <div className="max-w-3xl mb-8">
          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none mb-4">
            TAKE COMMAND OF <br />
            <span className="text-giallo text-glow-giallo">THE STORM.</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-300 font-sans leading-relaxed">
            You have experienced the ultimate threshold of wet-tarmac grip and V12 engineering.
            Configure your bespoke masterpiece with Ad Personam personalization or request an
            exclusive private track session with Lamborghini Squadra Corse instructors.
          </p>
        </div>

        {/* Primary CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {/* CTA 1: Official Configurator */}
          <a
            href="https://configurator.lamborghini.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="glass-giallo p-6 border-2 border-giallo hover:bg-giallo/20 transition-all duration-300 h-full flex flex-col justify-between cursor-pointer clip-hex-btn shadow-giallo-glow">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-giallo uppercase tracking-widest">
                    STEP 01 // BESPOKE BUILD
                  </span>
                  <ExternalLink className="w-5 h-5 text-giallo group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  OFFICIAL 3D CONFIGURATOR
                </h3>
                <p className="text-xs text-neutral-300 mt-2">
                  Customize exterior liveries (Giallo Auge, Verde Mantis, Grigio Telesto), carbon fiber packages, and bespoke Alcantara interiors.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 font-mono text-xs font-bold text-giallo uppercase tracking-wider">
                <span>LAUNCH 3D STUDIO</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </a>

          {/* CTA 2: VIP Track Experience & Private Consultation */}
          <div
            onClick={onOpenBooking}
            className="glass-card p-6 border border-white/20 hover:border-giallo/60 hover:bg-white/5 transition-all duration-300 h-full flex flex-col justify-between cursor-pointer clip-hex-btn group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-widest">
                  STEP 02 // VIP ACCESS
                </span>
                <Calendar className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                PRIVATE TRACK TEST &amp; CONCIERGE
              </h3>
              <p className="text-xs text-neutral-300 mt-2">
                Schedule a dedicated wet-handling masterclass at Monza or Nürburgring with factory telemetry engineers and certified drivers.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 font-mono text-xs font-bold text-white uppercase tracking-wider group-hover:text-giallo transition-colors">
              <span>SCHEDULE VIP SESSION</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>

        {/* Technical Specification Accordions */}
        <div className="border-t border-white/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-giallo" />
              TECHNICAL SPECIFICATION SHEET
            </h4>
            <span className="text-[10px] font-mono text-neutral-400 uppercase">
              HOMOLOGATED DATA
            </span>
          </div>

          <div className="space-y-3">
            {SPEC_SECTIONS.map((section, sIdx) => {
              const isOpen = activeAccordion === sIdx;
              const Icon = section.icon;
              return (
                <div
                  key={section.title}
                  className="glass-card border border-white/10 overflow-hidden"
                >
                  <button
                    onClick={() => setActiveAccordion(isOpen ? null : sIdx)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-giallo" />
                      <span className="font-mono text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                        {section.title}
                      </span>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-giallo" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono border-t border-white/5 animate-in fade-in duration-200">
                      {section.specs.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="flex items-center justify-between p-2 bg-black/40 border border-white/5"
                        >
                          <span className="text-neutral-400">{item.label}</span>
                          <span className="text-white font-bold text-right ml-2">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Replay Action */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>AUTHENTIC AUTOMOBILI LAMBORGHINI DIGITAL EXPERIENCE</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRestart}
            className="flex items-center gap-2 font-mono text-neutral-300 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART EXPERIENCE</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
