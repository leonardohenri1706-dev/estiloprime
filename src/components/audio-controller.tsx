"use client";

import React, { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Sparkles, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudioControllerProps {
  scrollProgress: number; // 0 to 1
  isMuted: boolean;
  onToggleMute: () => void;
}

export function AudioController({
  scrollProgress,
  isMuted,
  onToggleMute,
}: AudioControllerProps) {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const engineGainRef = useRef<GainNode | null>(null);
  const stormGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const osc3Ref = useRef<OscillatorNode | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize Web Audio API Synth
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.45, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      // 1. ENGINE SYNTHESIZER (V12 Harmonic simulation)
      const engineGain = ctx.createGain();
      engineGain.gain.setValueAtTime(0.3, ctx.currentTime);
      engineGainRef.current = engineGain;

      // Low rumble osc
      const osc1 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(65, ctx.currentTime); // Base idle ~800 RPM tone

      // Mid harmonic osc
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(130, ctx.currentTime);

      // High rasp osc (V12 scream)
      const osc3 = ctx.createOscillator();
      osc3.type = "sawtooth";
      osc3.frequency.setValueAtTime(195, ctx.currentTime);

      // Lowpass filter for engine tone
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.Q.setValueAtTime(3.5, ctx.currentTime);
      filterRef.current = filter;

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(engineGain);
      engineGain.connect(masterGain);

      osc1.start();
      osc2.start();
      osc3.start();

      osc1Ref.current = osc1;
      osc2Ref.current = osc2;
      osc3Ref.current = osc3;

      // 2. RAINSTORM / WET TRACK SPRAY NOISE
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1; // White noise
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Rain storm bandpass filter
      const stormFilter = ctx.createBiquadFilter();
      stormFilter.type = "bandpass";
      stormFilter.frequency.setValueAtTime(1200, ctx.currentTime);
      stormFilter.Q.setValueAtTime(0.8, ctx.currentTime);

      const stormGain = ctx.createGain();
      stormGain.gain.setValueAtTime(0.18, ctx.currentTime);
      stormGainRef.current = stormGain;

      whiteNoise.connect(stormFilter);
      stormFilter.connect(stormGain);
      stormGain.connect(masterGain);

      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;

      setIsPlaying(true);
    } catch (err) {
      console.warn("Audio Context init deferred:", err);
    }
  };

  // Toggle Mute / Playback with fade
  useEffect(() => {
    if (!masterGainRef.current || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === "suspended" && !isMuted) {
      ctx.resume();
    }
    const targetGain = isMuted ? 0.0001 : 0.45;
    masterGainRef.current.gain.cancelScheduledValues(ctx.currentTime);
    masterGainRef.current.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.3);
  }, [isMuted]);

  // Modulate RPM & Engine Scream based on scroll progression
  useEffect(() => {
    if (!audioCtxRef.current || !osc1Ref.current || !filterRef.current) return;
    const ctx = audioCtxRef.current;

    // RPM shifts simulation across the 4 sectors
    // Base 60Hz idle -> up to 280Hz at 9,200 RPM redline
    const rpmFactor = Math.sin(scrollProgress * Math.PI * 2.5);
    const targetFreq = 70 + Math.abs(rpmFactor) * 160 + scrollProgress * 60;
    const targetCutoff = 400 + Math.abs(rpmFactor) * 1800 + scrollProgress * 800;

    osc1Ref.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);
    if (osc2Ref.current) osc2Ref.current.frequency.setTargetAtTime(targetFreq * 2, ctx.currentTime, 0.1);
    if (osc3Ref.current) osc3Ref.current.frequency.setTargetAtTime(targetFreq * 3, ctx.currentTime, 0.1);
    filterRef.current.frequency.setTargetAtTime(targetCutoff, ctx.currentTime, 0.1);

    // Increase rain spray hiss when vehicle speeds up in mid-scroll
    if (stormGainRef.current) {
      const sprayLevel = 0.12 + Math.min(0.25, scrollProgress * 0.3);
      stormGainRef.current.gain.setTargetAtTime(sprayLevel, ctx.currentTime, 0.1);
    }
  }, [scrollProgress]);

  const handleToggle = () => {
    if (!audioCtxRef.current) {
      initAudio();
    }
    onToggleMute();
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      <Button
        variant={isMuted ? "glass" : "giallo"}
        size="sm"
        onClick={handleToggle}
        className="backdrop-blur-md shadow-2xl group flex items-center gap-2.5 transition-all duration-300"
        title={isMuted ? "Enable 3D V12 Audio & Rain Experience" : "Mute Sound"}
      >
        {isMuted ? (
          <>
            <VolumeX className="w-4 h-4 text-neutral-400 group-hover:text-white" />
            <span className="text-xs tracking-wider uppercase font-mono hidden sm:inline">
              Sound: OFF
            </span>
          </>
        ) : (
          <>
            <Volume2 className="w-4 h-4 animate-pulse text-black" />
            <span className="text-xs font-bold tracking-wider uppercase font-mono hidden sm:inline">
              V12 Atmos: LIVE
            </span>
            {/* Equalizer animation bars */}
            <div className="flex items-end gap-[2px] h-3 ml-1">
              <span className="w-0.5 bg-black h-2 animate-[pulse_0.4s_ease-in-out_infinite]" />
              <span className="w-0.5 bg-black h-3 animate-[pulse_0.6s_ease-in-out_infinite_0.1s]" />
              <span className="w-0.5 bg-black h-1.5 animate-[pulse_0.5s_ease-in-out_infinite_0.2s]" />
              <span className="w-0.5 bg-black h-3.5 animate-[pulse_0.7s_ease-in-out_infinite_0.15s]" />
            </div>
          </>
        )}
      </Button>
    </div>
  );
}
