"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Search, LayoutList, LayoutGrid, Loader2 } from "lucide-react";
import { CATEGORIES } from "@/lib/schemas/admin.schema";

const sw = { strokeWidth: 1.5 } as const;

export default function ProductsToolbar({ view }: { view: "lista" | "grid" }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    start(() => router.replace(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  const sel =
    "h-11 min-h-11 rounded-lg border border-stone-800 bg-stone-900 px-3 text-xs text-stone-200 outline-none focus:border-amber-500/50 transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px]">
        {pending ? (
          <Loader2 {...sw} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 animate-spin" />
        ) : (
          <Search {...sw} className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
        )}
        <input
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            window.clearTimeout((window as unknown as { __epT?: number }).__epT);
            (window as unknown as { __epT?: number }).__epT = window.setTimeout(() => setParam("q", v), 350);
          }}
          placeholder="Buscar por nome ou SKU..."
          className="h-11 w-full rounded-lg border border-stone-800 bg-stone-900 pl-9 pr-3 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>

      <select
        value={params.get("cat") ?? ""} onChange={(e) => setParam("cat", e.target.value)}
        className={sel} aria-label="Categoria"
      >
        <option value="">Todas categorias</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={params.get("status") ?? ""} onChange={(e) => setParam("status", e.target.value)}
        className={sel} aria-label="Status"
      >
        <option value="">Ativos + Pausados</option>
        <option value="ativo">Somente ativos</option>
        <option value="pausado">Pausados</option>
      </select>

      <select
        value={params.get("stock") ?? ""} onChange={(e) => setParam("stock", e.target.value)}
        className={sel} aria-label="Estoque"
      >
        <option value="">Todo estoque</option>
        <option value="ok">Em estoque</option>
        <option value="critico">Crítico (&lt;2)</option>
        <option value="esgotado">Esgotado</option>
      </select>

      <div className="flex p-1 rounded-lg border border-stone-800 bg-stone-900">
        {([["lista", LayoutList], ["grid", LayoutGrid]] as const).map(([v, Icon]) => (
          <button
            key={v} onClick={() => setParam("view", v === "lista" ? "" : v)} title={`Ver em ${v}`}
            className={`h-9 w-10 grid place-items-center rounded-md transition-all duration-150 active:scale-[0.98] ${
              (view === "lista" ? "" : view) === v ? "bg-amber-500/15 text-amber-400" : "text-stone-500 hover:text-stone-300"
            }`}
          >
            <Icon {...sw} className="w-4 h-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
