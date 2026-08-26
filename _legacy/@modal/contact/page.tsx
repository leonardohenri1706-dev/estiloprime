"use client";

import { useRouter } from "next/navigation";
import { VipBookingModal } from "@/components/vip-booking-modal";

export default function ContactModalPage() {
  const router = useRouter();

  return (
    <VipBookingModal
      isOpen={true}
      onClose={() => router.back()}
    />
  );
}
