"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Plus, Trash2, Power, Loader2, MessageCircle, KeyRound, CreditCard, Banknote, Smartphone } from "lucide-react";
import {
  saveSettingsAction, addZoneAction, saveZoneAction,
  removeZoneAction, toggleZoneAction,
} from "@/lib/actions/admin.actions";
import { brl, waLink, onlyDigits } from "@/lib/admin/format";
import { pixKeyTypeSchema, type SettingsInput } from "@/lib/schemas/admin.schema";

const sw = { strokeWidth: 1.5 } as const;

const inp =
  "h-11 w-full rounded-lg border border-stone-800 bg-stone-900 px-3.5 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors";
const lbl = "text-xs font-medium text-stone-400 mb-1.5 block";
const card = "rounded-xl border border-stone-800 bg-stone-900/60 p-4 sm:p-5";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button" role="switch" aria-checked={on} onClick={onClick}
      className={`h-6 w-11 rounded-full border relative shrink-0 transition-colors duration-150 active:scale-[0.98] ${
        on ? "bg-emerald-500/20 border-emerald-500/50" : "bg-stone-800 border-stone-700"
      }`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-150 ${
          on ? "left-[calc(100%-1.35rem)] bg-emerald-400" : "left-1 bg-stone-500"
        }`}
        style={{ height: 18, width: 18 }}
      />
    </button>
  );
}

type ZoneT = { id: string; location: string; fee: number; isActive: boolean };

export default function SettingsForm({
  settings,
  zones,
}: {
  settings: SettingsInput;
  zones: ZoneT[];
}) {
  const [form, setForm] = useState<SettingsInput>(settings);
  const [saving, startSave] = useTransition();
  const [busy, startBusy] = useTransition();

  const set = <K extends keyof SettingsInput>(k: K, v: SettingsInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = () =>
    startSave(async () => {
      try {
        await saveSettingsAction(form);
        toast.success("Configurações salvas");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao salvar");
      }
    });

  const zoneRun = (fn: () => Promise<unknown>, ok: string) =>
    startBusy(async () => {
      try { await fn(); toast.success(ok); }
      catch (e) { toast.error(e instanceof Error ? e.message : "Erro"); }
    });

  const togglePayment = (key: keyof SettingsInput) => {
    setForm((f) => ({ ...f, [key]: !f[key] }));
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
      {/* Pagamento & atendimento */}
      <section className={`${card} space-y-4`}>
        <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
          <KeyRound {...sw} className="w-4 h-4 text-amber-400" /> Pagamento &amp; atendimento
        </h2>

        <div>
          <label className={lbl} htmlFor="wa">WhatsApp oficial das comandas</label>
          <div className="flex gap-2">
            <input id="wa" value={form.whatsappNumber}
              onChange={(e) => set("whatsappNumber", e.target.value)}
              onBlur={(e) => set("whatsappNumber", onlyDigits(e.target.value))}
              placeholder="5588999999999"
              className={`${inp} tabular-nums`} />
            <a
              href={waLink(form.whatsappNumber, "Teste de disparo — painel Estilo Prime ✅")}
              target="_blank" rel="noopener noreferrer" title="Testar disparo"
              className="h-11 px-3 grid place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors active:scale-[0.98]"
            >
              <MessageCircle {...sw} className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className={lbl} htmlFor="pix">Chave Pix</label>
            <input id="pix" value={form.pixKey ?? ""} onChange={(e) => set("pixKey", e.target.value)} className={`${inp} tabular-nums`} />
          </div>
          <div>
            <label className={lbl} htmlFor="pixType">Tipo</label>
            <select
              id="pixType"
              value={form.pixKeyType ?? "CELULAR"}
              onChange={(e) => set("pixKeyType", e.target.value as typeof pixKeyTypeSchema._type)}
              className="h-11 rounded-lg border border-stone-800 bg-stone-900 px-3 text-xs text-stone-200 outline-none focus:border-amber-500/50"
            >
              {["CELULAR", "CPF", "CNPJ", "ALEATORIA"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={lbl} htmlFor="pixName">Nome do titular</label>
          <input id="pixName" value={form.pixName ?? ""} onChange={(e) => set("pixName", e.target.value)} className={inp} />
        </div>

        <button
          onClick={save} disabled={saving}
          className="h-11 w-full rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold text-sm inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98]"
        >
          {saving && <Loader2 {...sw} className="w-4 h-4 animate-spin" />}
          Salvar configurações
        </button>
      </section>

      {/* Formas de pagamento */}
      <section className={`${card} space-y-4`}>
        <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
          <CreditCard {...sw} className="w-4 h-4 text-amber-400" /> Formas de pagamento
        </h2>
        <p className="text-[11px] text-stone-500">Ative as formas que a loja aceita. Aparecem no checkout e na comanda.</p>

        <div className="space-y-2">
          <PaymentToggle
            icon={<Banknote {...sw} className="w-4 h-4" />}
            label="Dinheiro no balcão"
            desc="Pagamento à vista na retirada"
            on={!!form.paymentCashEnabled}
            onClick={() => togglePayment("paymentCashEnabled")}
          />
          <PaymentToggle
            icon={<Smartphone {...sw} className="w-4 h-4" />}
            label="Pix"
            desc={`Chave: ${form.pixKey || "não configurada"} (${form.pixKeyType || "CELULAR"})`}
            on={!!form.paymentPixEnabled}
            onClick={() => togglePayment("paymentPixEnabled")}
          />
          <PaymentToggle
            icon={<CreditCard {...sw} className="w-4 h-4" />}
            label="Cartão (crédito/débito)"
            desc="Maquininha ou link de pagamento"
            on={!!form.paymentCardEnabled}
            onClick={() => togglePayment("paymentCardEnabled")}
          />
        </div>

        {form.paymentPixEnabled && (
          <div className="mt-3 rounded-lg border border-dashed border-stone-800 p-3 space-y-2">
            <p className="text-[11px] text-stone-500 font-medium">QR Code Pix (opcional)</p>
            <p className="text-[10px] text-stone-600">Cole a URL da imagem do QR Code para aparecer na comanda.</p>
            <input
              value={form.pixQrCode ?? ""}
              onChange={(e) => set("pixQrCode", e.target.value)}
              placeholder="https://exemplo.com/qrcode-pix.jpg"
              className={inp}
            />
          </div>
        )}

        <button
          onClick={save} disabled={saving}
          className="h-11 w-full rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold text-sm inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98]"
        >
          {saving && <Loader2 {...sw} className="w-4 h-4 animate-spin" />}
          Salvar formas de pagamento
        </button>
      </section>

      {/* Zonas de entrega */}
      <section className={`${card}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight">Taxas de entrega</h2>
          <NewZoneDialog onAdd={(payload) => zoneRun(() => addZoneAction(payload), "Cidade adicionada")} />
        </div>

        <ul className="space-y-2">
          {zones.map((z) => (
            <li key={z.id} className={`rounded-lg border p-3 transition-colors ${z.isActive ? "border-stone-800" : "border-dashed border-stone-800 opacity-60"}`}>
              <div className="flex items-center gap-2 min-h-11">
                <Toggle on={z.isActive} onClick={() => zoneRun(() => toggleZoneAction(z.id), z.isActive ? "Zona pausada" : "Zona ativada")} />
                <ZoneRow zone={z} onSave={(p) => zoneRun(() => saveZoneAction(z.id, p), "Taxa atualizada")} />
                <button
                  title="Remover cidade"
                  disabled={busy || /balcão/i.test(z.location)}
                  onClick={() => confirm(`Remover "${z.location}"?`) && zoneRun(() => removeZoneAction(z.id), "Zona removida")}
                  className="h-9 w-9 grid place-items-center rounded-lg text-stone-600 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:pointer-events-none transition-colors active:scale-[0.98]"
                >
                  <Trash2 {...sw} className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2 rounded-lg border border-dashed border-stone-800 p-3">
          <ToggleLine label="Entrega grátis para regiões próximas" on={!!settings.freeDeliveryEnabled} />
          <ToggleLine label="Retirada no balcão da loja" on={!!settings.pickupEnabled} />
          <p className="text-[10px] text-stone-600 pt-1">Toggles refletidos no checkout da loja ao salvar.</p>
        </div>
      </section>
    </div>
  );
}

function ToggleLine({ label, on }: { label: string; on: boolean }) {
  const [v, setV] = useState(on);
  return (
    <div className="flex items-center justify-between min-h-11">
      <span className="text-xs font-medium text-stone-300">{label}</span>
      <Toggle on={v} onClick={() => setV(!v)} />
    </div>
  );
}

function ZoneRow({ zone, onSave }: { zone: ZoneT; onSave: (p: { location: string; fee: number; isActive: boolean }) => void }) {
  const [location, setLocation] = useState(zone.location);
  const [fee, setFee] = useState(String(zone.fee));

  return (
    <>
      <input
        value={location} onChange={(e) => setLocation(e.target.value)}
        aria-label={`Nome da zona ${zone.location}`}
        className="h-9 min-w-0 flex-1 rounded-md border border-transparent hover:border-stone-800 focus:border-amber-500/50 bg-transparent px-2 text-xs font-medium text-stone-200 outline-none transition-colors"
      />
      <span className="tabular-nums text-[10px] text-stone-600 hidden sm:inline">{brl(Number(fee) || 0)}</span>
      <input
        value={fee}
        onChange={(e) => setFee(e.target.value)}
        onBlur={() => Number(fee) !== zone.fee && onSave({ location, fee: Math.max(0, Number(fee) || 0), isActive: true })}
        type="number" min="0" step="1" max="500"
        aria-label={`Taxa de ${zone.location}`}
        className="h-9 w-16 rounded-md border border-stone-800 bg-stone-950 px-2 text-center text-xs tabular-nums text-stone-100 outline-none focus:border-amber-500/50"
      />
    </>
  );
}

function NewZoneDialog({ onAdd }: { onAdd: (p: { location: string; fee: number; isActive: boolean }) => void }) {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("");
  const [fee, setFee] = useState("10");

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="h-11 px-3.5 inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold hover:bg-amber-500/15 transition-colors active:scale-[0.98]">
          <Plus {...sw} className="w-4 h-4" /> Nova cidade
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-stone-800 bg-stone-900 p-5 shadow-2xl focus:outline-none">
          <Dialog.Title className="text-sm font-semibold mb-4">Nova cidade / bairro</Dialog.Title>
          <div className="space-y-3">
            <div>
              <label className={lbl} htmlFor="zl">Local</label>
              <input id="zl" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Fortim" className={inp} autoFocus />
            </div>
            <div>
              <label className={lbl} htmlFor="zf">Taxa (R$)</label>
              <input id="zf" type="number" min="0" value={fee} onChange={(e) => setFee(e.target.value)} className={`${inp} tabular-nums`} />
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <Dialog.Close asChild>
              <button className="h-11 flex-1 rounded-lg border border-stone-700 text-xs font-semibold text-stone-300 hover:text-stone-100 transition-colors active:scale-[0.98]">
                Cancelar
              </button>
            </Dialog.Close>
            <button
              disabled={!location.trim()}
              onClick={() => {
                onAdd({ location: location.trim(), fee: Math.max(0, Number(fee) || 0), isActive: true });
                setOpen(false); setLocation(""); setFee("10");
              }}
              className="h-11 flex-1 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <Power {...sw} className="w-3.5 h-3.5" /> Adicionar ativa
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PaymentToggle({
  icon,
  label,
  desc,
  on,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-lg border p-3 transition-all active:scale-[0.99] ${
        on
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-stone-800 bg-stone-950/60 opacity-60"
      }`}
    >
      <div className={`h-9 w-9 rounded-lg grid place-items-center shrink-0 ${
        on ? "bg-emerald-500/15 text-emerald-400" : "bg-stone-800 text-stone-500"
      }`}>
        {icon}
      </div>
      <div className="text-left min-w-0 flex-1">
        <p className={`text-xs font-semibold ${on ? "text-stone-100" : "text-stone-400"}`}>{label}</p>
        <p className="text-[10px] text-stone-500 truncate">{desc}</p>
      </div>
      <div className={`h-6 w-11 rounded-full border relative shrink-0 transition-colors duration-150 ${
        on ? "bg-emerald-500/20 border-emerald-500/50" : "bg-stone-800 border-stone-700"
      }`}>
        <span
          className={`absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-150 ${
            on ? "left-[calc(100%-1.35rem)] bg-emerald-400" : "left-1 bg-stone-500"
          }`}
          style={{ height: 18, width: 18 }}
        />
      </div>
    </button>
  );
}
