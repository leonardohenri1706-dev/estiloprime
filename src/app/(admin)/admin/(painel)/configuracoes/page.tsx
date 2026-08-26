import SettingsForm from "@/components/admin/SettingsForm";
import { getSettings, getZones } from "@/lib/db/store";
import { pixKeyTypeSchema } from "@/lib/schemas/admin.schema";

export const dynamic = "force-dynamic";

export default async function ConfiguracoesPage() {
  const [s, zones] = await Promise.all([getSettings(), getZones()]);
  const pixType = pixKeyTypeSchema.safeParse(s.pixKeyType).success
    ? (s.pixKeyType as (typeof pixKeyTypeSchema._type))
    : "CELULAR";
  return (
    <div>
      <p className="text-xs text-stone-500 mb-4">
        Pix, WhatsApp oficial, formas de pagamento e taxas regionais.
      </p>
      <SettingsForm
        settings={{
          whatsappNumber: s.whatsappNumber ?? "5588999999999",
          pixKey: s.pixKey ?? "",
          pixKeyType: pixType,
          pixName: s.pixName ?? "",
          freeDeliveryEnabled: s.freeDeliveryEnabled ?? true,
          pickupEnabled: s.pickupEnabled ?? true,
          paymentCashEnabled: (s as unknown as { paymentCashEnabled?: boolean }).paymentCashEnabled ?? true,
          paymentPixEnabled: (s as unknown as { paymentPixEnabled?: boolean }).paymentPixEnabled ?? true,
          paymentCardEnabled: (s as unknown as { paymentCardEnabled?: boolean }).paymentCardEnabled ?? false,
          pixQrCode: (s as unknown as { pixQrCode?: string }).pixQrCode ?? "",
        }}
        zones={zones.map((z) => ({
          id: z.id, location: z.location, fee: z.fee, isActive: z.isActive,
        }))}
      />
    </div>
  );
}
