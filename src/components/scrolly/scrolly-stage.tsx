"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Lenis from "lenis";
import { useCanvasFrames } from "@/lib/hooks/use-canvas-frames";
import { useReducedMotion } from "@/lib/hooks/use-reduced-motion";
import { ScrollProgress } from "./scroll-progress";
import { TelemetryHud } from "./telemetry-hud";
import { AeroHotspots } from "./aero-hotspots";
import { HeroOverlay } from "../hero-overlay";
import { AerodynamicsOverlay } from "../aerodynamics-overlay";
import { ConversionTerminal } from "../conversion-terminal";
import { AudioController } from "../audio-controller";
import { VipBookingModal } from "../vip-booking-modal";
import { Loader2, ArrowDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOTAL_FRAMES = 120;

export function ScrollyStage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);

  const prefersReducedMotion = useReducedMotion();

  const {
    getFrame,
    loadedCount,
    totalFrames,
    progress: preloadProgress,
    isFirstFrameLoaded,
    isAllLoaded,
  } = useCanvasFrames({
    totalFrames: TOTAL_FRAMES,
    framePrefix: "/frames/",
    frameExtension: ".webp",
  });

  // Draw frame on canvas with high-DPI and cover scaling
  const renderFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return;

      const img = getFrame(frameIndex);
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Calculate object-fit: cover coordinates
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;
      const imgRatio = imgWidth / imgHeight;
      const screenRatio = width / height;

      let drawWidth = width;
      let drawHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (screenRatio > imgRatio) {
        drawWidth = width;
        drawHeight = width / imgRatio;
        offsetY = (height - drawHeight) / 2;
      } else {
        drawHeight = height;
        drawWidth = height * imgRatio;
        offsetX = (width - drawWidth) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

      // Add subtle cinematic vignette & wet asphalt tone overlay
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.3,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.8
      );
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.05)");
      gradient.addColorStop(1, "rgba(5, 7, 10, 0.65)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      ctx.restore();
    },
    [getFrame]
  );

  // Initialize Lenis smooth scroll
  useEffect(() => {
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [prefersReducedMotion]);

  // Scroll listener for calculating frame interpolation
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const totalScrollable = container.scrollHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      const scrollY = window.scrollY;
      const rawProgress = Math.max(0, Math.min(1, scrollY / totalScrollable));
      setScrollProgress(rawProgress);

      const targetFrame = Math.min(
        TOTAL_FRAMES - 1,
        Math.floor(rawProgress * TOTAL_FRAMES)
      );
      setCurrentFrameIndex(targetFrame);
      renderFrame(targetFrame);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    // Initial draw
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [renderFrame]);

  // Draw first frame as soon as loaded
  useEffect(() => {
    if (isFirstFrameLoaded) {
      renderFrame(currentFrameIndex);
    }
  }, [isFirstFrameLoaded, currentFrameIndex, renderFrame]);

  // Chapter Sector Jumps
  const handleSectorJump = (sectorIndex: number) => {
    if (!containerRef.current) return;
    const sectorTargets = [0, 0.35, 0.65, 0.95];
    const targetProgress = sectorTargets[sectorIndex] ?? 0;
    const totalScrollable = containerRef.current.scrollHeight - window.innerHeight;
    const targetY = targetProgress * totalScrollable;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(targetY, { duration: 1.5 });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  const handleRestart = () => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 1.8 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full bg-asphalt-900" style={{ height: "450vh" }}>
      {/* Preloader overlay (shows until first frame is ready or during initial asset stream) */}
      {!isFirstFrameLoaded && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-giallo clip-hex-btn flex items-center justify-center font-display font-black text-black text-2xl shadow-giallo-glow mb-6 animate-pulse">
            L
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">
            INITIALIZING LAMBORGHINI V12 TELEMETRY
          </h2>
          <p className="font-mono text-xs text-neutral-400 max-w-sm mb-6">
            Preloading 120 high-fidelity frames for 60/120 FPS scrollytelling precision...
          </p>
          <div className="w-64 h-1.5 bg-neutral-800 border border-white/10 relative overflow-hidden">
            <div
              className="h-full bg-giallo shadow-giallo-glow transition-all duration-150"
              style={{ width: `${preloadProgress}%` }}
            />
          </div>
          <span className="font-mono text-xs text-giallo font-bold mt-2">
            {preloadProgress}% READY
          </span>
        </div>
      )}

      {/* Sticky Fullscreen Stage (100dvh) */}
      <div className="sticky top-0 left-0 w-full h-[100dvh] overflow-hidden">
        {/* Canvas Scrollytelling Sequence */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Rain and Atmosphere Particle Scanline Layer */}
        <div className="absolute inset-0 scanlines pointer-events-none z-10" />

        {/* Top Progress & Sector Navigation */}
        <ScrollProgress
          progress={scrollProgress}
          onSectorClick={handleSectorJump}
        />

        {/* Chapter 1: Hero Overlay (0% to 25%) */}
        <HeroOverlay
          progress={scrollProgress}
          onExploreClick={() => handleSectorJump(1)}
          onOpenBooking={() => setIsBookingModalOpen(true)}
        />

        {/* Chapter 2: Performance Telemetry HUD (Visible from 15% onwards) */}
        {scrollProgress >= 0.12 && scrollProgress <= 0.88 && (
          <div className="absolute bottom-8 left-6 sm:left-12 z-30 max-w-sm w-[calc(100%-3rem)] sm:w-96 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
            <TelemetryHud progress={scrollProgress} />
          </div>
        )}

        {/* Interactive Downforce & Aero Hotspots */}
        <AeroHotspots progress={scrollProgress} />

        {/* Chapter 3: Aerodynamics Callout Overlay */}
        <AerodynamicsOverlay progress={scrollProgress} />

        {/* Audio Engine Controller */}
        <AudioController
          scrollProgress={scrollProgress}
          isMuted={isAudioMuted}
          onToggleMute={() => setIsAudioMuted((prev) => !prev)}
        />
      </div>

      {/* Chapter 4: Conversion Terminal (Appears at the bottom of the scroll track) */}
      <div className="relative z-30 -mt-[100dvh]">
        <ConversionTerminal
          progress={scrollProgress}
          onOpenBooking={() => setIsBookingModalOpen(true)}
          onRestart={handleRestart}
        />
      </div>

      {/* VIP Booking Dialog Modal */}
      <VipBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </div>
  );
}
