import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getProducts } from "@/lib/db/store";
import type { ProductT } from "@/lib/db/store";
import { brl } from "@/lib/admin/format";
import { CATEGORY_LABEL, SIZES } from "@/lib/schemas/admin.schema";
import ProductsToolbar from "@/components/admin/ProductsToolbar";
import {
  QuickStockEditor, ActiveSwitch, DeleteProductButton,
} from "@/components/admin/QuickStockEditor";

export const dynamic = "force-dynamic";

const sw = { strokeWidth: 1.5 } as const;

function stocksOf(p: ProductT) {
  return Object.fromEntries(p.variants.map((v) => [v.size, v.stock]));
}
const total = (p: ProductT) => p.variants.reduce((s, v) => s + v.stock, 0);
const cover = (p: ProductT) => p.images.find((i) => i.isCover)?.url ?? p.images[0]?.url ?? "";

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams?: { q?: string; cat?: string; status?: string; stock?: string; view?: string };
}) {
  const sp = searchParams ?? {};
  const view = sp.view === "grid" ? "grid" : "lista";

  let list = await getProducts();
  if (sp.q) {
    const t = sp.q.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(t) || p.slug.includes(t));
  }
  if (sp.cat) list = list.filter((p) => p.category === sp.cat);
  if (sp.status === "ativo") list = list.filter((p) => p.isActive);
  if (sp.status === "pausado") list = list.filter((p) => !p.isActive);
  if (sp.stock === "ok") list = list.filter((p) => total(p) > 0 && Math.min(...p.variants.map((v) => v.stock)) >= 2);
  if (sp.stock === "critico") list = list.filter((p) => Math.min(...p.variants.map((v) => v.stock)) < 2 && total(p) > 0);
  if (sp.stock === "esgotado") list = list.filter((p) => total(p) === 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-xs text-stone-500 tabular-nums">{list.length} produto(s)</p>
        <Link
          href="/admin/produtos/novo"
          className="ml-auto h-11 px-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-semibold transition-all duration-150 active:scale-[0.98]"
        >
          <Plus {...sw} className="w-4 h-4" /> Novo produto
        </Link>
      </div>

      <ProductsToolbar view={view} />

      {view === "lista" ? (
        <div className="rounded-xl border border-stone-800 bg-stone-900/60 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-stone-500 border-b border-stone-800">
                <th className="p-4 font-medium">Produto</th>
                <th className="p-4 font-medium">Categoria</th>
                <th className="p-4 font-medium">Preço</th>
                <th className="p-4 font-medium">Estoque rápido</th>
                <th className="p-4 font-medium">Ativo</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/70">
              {list.map((p) => (
                <tr key={p.id} className="hover:bg-stone-800/25 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover(p)} alt="" className="w-11 h-11 rounded-lg object-cover border border-stone-800 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate max-w-[240px]">{p.name}</p>
                        <p className="text-[10px] text-stone-600 truncate max-w-[240px]">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-semibold px-2 py-1 rounded-md border border-stone-700 text-stone-400">
                      {CATEGORY_LABEL[p.category]}
                    </span>
                  </td>
                  <td className="p-3 tabular-nums">
                    <span className="font-semibold">{brl(p.price)}</span>
                    <span className="ml-1.5 text-xs text-stone-600 line-through">{brl(p.oldPrice)}</span>
                  </td>
                  <td className="p-3"><QuickStockEditor productId={p.id} stocks={stocksOf(p)} /></td>
                  <td className="p-3"><ActiveSwitch id={p.id} isActive={p.isActive} /></td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/produtos/${p.id}`}
                        className="h-9 w-9 grid place-items-center rounded-lg border border-stone-800 hover:border-amber-500/40 text-stone-400 hover:text-amber-400 transition-colors active:scale-[0.98]"
                        title="Editar"
                      >
                        <Pencil {...sw} className="w-4 h-4" />
                      </Link>
                      <DeleteProductButton id={p.id} name={p.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!list.length && (
            <p className="py-14 text-center text-sm text-stone-500">Nenhum produto com esses filtros.</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {list.map((p) => (
              <div key={p.id} className="rounded-xl border border-stone-800 bg-stone-900/60 overflow-hidden group">
                <div className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover(p)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  {!p.isActive && (
                    <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-stone-950/85 border border-stone-700 text-stone-400">
                      Pausado
                    </span>
                  )}
                  <span className={`absolute bottom-2 right-2 text-[10px] font-bold tabular-nums px-2 py-1 rounded-md border ${
                    total(p) === 0
                      ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                      : "bg-stone-950/85 border-stone-700 text-stone-300"
                  }`}>
                    {total(p)} un
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-xs font-semibold line-clamp-2 min-h-[2rem] leading-4">{p.name}</p>
                  <p className="tabular-nums text-sm font-bold text-amber-400">{brl(p.price)}</p>
                  <div className="flex items-center justify-between pt-1">
                    <QuickStockEditor productId={p.id} stocks={stocksOf(p)} />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-stone-800">
                    <ActiveSwitch id={p.id} isActive={p.isActive} />
                    <Link href={`/admin/produtos/${p.id}`} className="h-8 px-2.5 inline-flex items-center gap-1 rounded-md border border-stone-800 hover:border-amber-500/40 text-[11px] text-stone-400 hover:text-amber-400 transition-colors">
                      <Pencil {...sw} className="w-3.5 h-3.5" /> editar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {!list.length && (
            <p className="py-14 text-center text-sm text-stone-500">Nenhum produto com esses filtros.</p>
          )}
        </>
      )}

      <p className="text-[10px] text-stone-700">Grade: {SIZES.join(" · ")}</p>
    </div>
  );
}
