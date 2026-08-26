"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateVariantStockAction, toggleProductActiveAction, deleteProductAction } from "@/lib/actions/admin.actions";
import { SIZES } from "@/lib/schemas/admin.schema";

export function QuickStockEditor({
  productId,
  stocks,
}: {
  productId: string;
  stocks: Record<string, number>;
}) {
  const [local, setLocal] = useState(stocks);
  const [, start] = useTransition();

  useEffect(() => setLocal(stocks), [stocks]);

  const commit = (size: string, raw: string) => {
    const value = Math.max(0, Math.min(999, parseInt(raw || "0", 10) || 0));
    setLocal((s) => ({ ...s, [size]: value }));
    start(async () => {
      try {
        await updateVariantStockAction(productId, size, value);
        toast.success(`Estoque ${size} → ${value}`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao salvar");
      }
    });
  };

  const tone = (v: number) =>
    v === 0 ? "border-rose-500/40 text-rose-400"
    : v < 2 ? "border-amber-500/40 text-amber-400"
    : "border-stone-800 text-stone-100 focus:border-amber-500/50";

  return (
    <div className="flex items-center gap-1.5">
      {SIZES.map((size) => (
        <label key={size} className="flex items-center gap-1">
          <span className="text-[10px] font-bold text-stone-500">{size}</span>
          <input
            type="number" min={0} max={999}
            value={local[size] ?? 0}
            onChange={(e) => setLocal((s) => ({ ...s, [size]: Math.max(0, parseInt(e.target.value || "0", 10) || 0) }))}
            onBlur={(e) => commit(size, e.target.value)}
            className={`h-9 w-12 rounded-md border bg-stone-950 px-1 text-center text-xs tabular-nums outline-none transition-colors ${tone(local[size] ?? 0)}`}
          />
        </label>
      ))}
    </div>
  );
}

export function ActiveSwitch({ id, isActive }: { id: string; isActive: boolean }) {
  const [on, setOn] = useState(isActive);
  const [, start] = useTransition();

  return (
    <button
      role="switch" aria-checked={on}
      onClick={() => {
        const next = !on;
        setOn(next);
        start(async () => {
          try {
            await toggleProductActiveAction(id);
            toast.success(next ? "Produto ativado" : "Produto pausado");
          } catch (e) {
            setOn(!next);
            toast.error(e instanceof Error ? e.message : "Erro");
          }
        });
      }}
      className={`h-6 w-11 rounded-full border transition-colors duration-150 relative shrink-0 ${
        on ? "bg-emerald-500/20 border-emerald-500/50" : "bg-stone-800 border-stone-700"
      }`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 h-4.5 w-4.5 rounded-full transition-all duration-150 ${
          on ? "left-[calc(100%-1.35rem)] bg-emerald-400" : "left-1 bg-stone-500"
        }`}
        style={{ height: 18, width: 18 }}
      />
    </button>
  );
}

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [, start] = useTransition();
  return (
    <button
      onClick={() =>
        confirm(`Excluir "${name}" permanentemente?`) &&
        start(async () => {
          try {
            await deleteProductAction(id);
            toast.success("Produto excluído");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Erro");
          }
        })
      }
      className="text-[10px] font-semibold uppercase tracking-wider text-stone-600 hover:text-rose-400 transition-colors"
    >
      excluir
    </button>
  );
}
