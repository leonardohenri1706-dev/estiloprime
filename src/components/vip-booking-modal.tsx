"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import confetti from "canvas-confetti";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LeadSchema, LeadFormData } from "@/lib/schemas/lead.schema";
import { submitVipLead, LeadSubmissionResult } from "@/app/actions/lead";
import { CheckCircle2, Loader2, Sparkles, Shield, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VipBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VipBookingModal({ isOpen, onClose }: VipBookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<LeadSubmissionResult | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(LeadSchema),
    defaultValues: {
      preferredTrack: "Monza (Italy)",
      interestType: "Private Track Experience & Hotlap Session",
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const result = await submitVipLead(data);
      setSubmissionResult(result);
      if (result.success) {
        // Trigger VIP confetti burst
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FFD700", "#FFA500", "#FFFFFF", "#38BDF8"],
        });
      }
    } catch (err) {
      setSubmissionResult({
        success: false,
        message: "Network error occurred. Please retry your submission.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    if (submissionResult?.success) {
      reset();
      setSubmissionResult(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="giallo" className="text-[10px]">
              SQUADRA CORSE CONCIERGE
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              PRIVATE ALLOCATION
            </Badge>
          </div>
          <DialogTitle>
            <Sparkles className="w-6 h-6 text-giallo" />
            VIP TRACK CONSULTATION
          </DialogTitle>
          <DialogDescription>
            Direct priority allocation and wet-track telemetry session with Lamborghini certified factory drivers.
          </DialogDescription>
        </DialogHeader>

        {submissionResult?.success ? (
          <div className="py-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-giallo/20 border-2 border-giallo flex items-center justify-center text-giallo mb-4 shadow-giallo-glow">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">
              SESSION CONFIRMED
            </h3>
            <p className="text-sm text-neutral-300 max-w-md mt-2 font-sans">
              {submissionResult.message}
            </p>
            <div className="my-6 p-4 glass-card border border-giallo/30 w-full text-center">
              <span className="text-xs font-mono text-neutral-400 block uppercase">
                YOUR EXCLUSIVE CONCIERGE PASS ID:
              </span>
              <span className="text-xl font-mono font-black text-giallo tracking-widest mt-1 block">
                {submissionResult.leadId}
              </span>
            </div>
            <Button variant="giallo" size="md" onClick={handleClose}>
              RETURN TO EXPERIENCE
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {submissionResult && !submissionResult.success && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-mono">
                {submissionResult.message}
              </div>
            )}

            {/* Name and Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1">
                  Full Legal Name *
                </label>
                <Input
                  placeholder="e.g. Matteo Rossi"
                  {...register("fullName")}
                  className={errors.fullName ? "border-red-500" : ""}
                />
                {errors.fullName && (
                  <p className="text-[11px] font-mono text-red-400 mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1">
                  Email Address *
                </label>
                <Input
                  type="email"
                  placeholder="name@domain.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-[11px] font-mono text-red-400 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* Phone & Preferred Track */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1">
                  Phone / WhatsApp *
                </label>
                <Input
                  placeholder="+1 (555) 000-0000"
                  {...register("phone")}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-[11px] font-mono text-red-400 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-neutral-300 mb-1">
                  Circuit Location *
                </label>
                <select
                  {...register("preferredTrack")}
                  className="flex h-12 w-full rounded-none border border-white/15 bg-black/60 px-3 py-2 text-xs font-mono text-white focus:border-giallo focus:outline-none"
                >
                  <option value="Monza (Italy)">Monza (Italy)</option>
                  <option value="Nürburgring Nordschleife (Germany)">
                    Nürburgring Nordschleife (Germany)
                  </option>
                  <option value="Circuit de Spa-Francorchamps (Belgium)">
                    Circuit de Spa-Francorchamps (Belgium)
                  </option>
                  <option value="Circuit of the Americas (USA)">
                    Circuit of the Americas (USA)
                  </option>
                  <option value="Suzuka International (Japan)">
                    Suzuka International (Japan)
                  </option>
                  <option value="Private Sant'Agata Bolognese Track">
                    Private Sant'Agata Bolognese Track
                  </option>
                </select>
              </div>
            </div>

            {/* Interest Type */}
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-300 mb-1">
                Consultation Scope *
              </label>
              <select
                {...register("interestType")}
                className="flex h-12 w-full rounded-none border border-white/15 bg-black/60 px-3 py-2 text-xs font-mono text-white focus:border-giallo focus:outline-none"
              >
                <option value="Private Track Experience & Hotlap Session">
                  Private Track Experience &amp; Hotlap Session
                </option>
                <option value="Ad Personam Bespoke Commissioning">
                  Ad Personam Bespoke Commissioning
                </option>
                <option value="Official Dealership Allocation Consultation">
                  Official Dealership Allocation Consultation
                </option>
                <option value="Hypercar Dynamic Driving Masterclass">
                  Hypercar Dynamic Driving Masterclass
                </option>
              </select>
            </div>

            {/* Current Garage / Notes */}
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-300 mb-1">
                Current Vehicle / Special Inquiries (Optional)
              </label>
              <Input
                placeholder="e.g. Aventador SVJ, Revuelto on order"
                {...register("currentVehicles")}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="giallo"
                size="lg"
                disabled={isSubmitting}
                className="w-full font-extrabold flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>ENCRYPTING &amp; TRANSMITTING...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    <span>TRANSMIT VIP ALLOCATION REQUEST</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
