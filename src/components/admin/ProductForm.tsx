"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ImagePlus, GripVertical, Trash2, Star, Loader2, WandSparkles,
} from "lucide-react";
import { productSchema, SIZES, CATEGORIES, CATEGORY_LABEL, type ProductInput } from "@/lib/schemas/admin.schema";
import { upsertProductAction } from "@/lib/actions/admin.actions";

const sw = { strokeWidth: 1.5 } as const;

const EXAMPLE_SEEDS = [
  "1620799140408-edc6dcb6d633",
  "1574180566232-aaad1b5b8450",
  "1562247879-0eac107b7e76",
];

type FormValues = ProductInput;

export default function ProductForm({
  defaultValues,
  productId,
}: {
  defaultValues?: Partial<FormValues>;
  productId?: string;
}) {
  const router = useRouter();
  const [saving, start] = useTransition();
  const [images, setImages] = useState<string[]>(defaultValues?.images ?? []);
  const [urlDraft, setUrlDraft] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [fillAll, setFillAll] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return toast.error("Apenas imagens são aceitas");
      if (file.size > 5 * 1024 * 1024) return toast.error("Máximo 5MB por imagem");
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImages((arr) => {
          const next = [...arr, dataUrl];
          setValue("images", next, { shouldValidate: true });
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", description: "", price: undefined as unknown as number,
      oldPrice: undefined, category: "POLOS", isActive: true,
      images: [], variants: SIZES.map((size) => ({ size, stock: 0 })),
      ...defaultValues,
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const variants = watch("variants");
  const nameVal = watch("name");

  const slugPreview =
    nameVal?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "slug-do-produto";

  const addImage = (url: string) => {
    const clean = url.trim();
    if (!/^https?:\/\//.test(clean)) return toast.error("Informe uma URL http(s) válida");
    setImages((arr) => [...arr, clean]);
    setValue("images", [...images, clean], { shouldValidate: true });
    setUrlDraft("");
  };

  const syncImages = (next: string[]) => {
    setImages(next);
    setValue("images", next, { shouldValidate: true });
  };

  const reorder = (from: number, to: number) => {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    syncImages(next);
  };

  const setStockAll = () => {
    const v = Math.max(0, parseInt(fillAll || "0", 10) || 0);
    setValue("variants", variants.map((x) => ({ ...x, stock: v })));
  };

  const onSubmit = (values: FormValues) =>
    start(async () => {
      try {
        await upsertProductAction({ ...values, id: productId });
        toast.success(productId ? "Produto atualizado!" : "Produto publicado!");
        router.push("/admin/produtos");
        router.refresh();
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Falha ao salvar");
      }
    });

  const inp =
    "h-11 w-full rounded-lg border border-stone-800 bg-stone-900 px-3.5 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-colors";
  const lbl = "text-xs font-medium text-stone-400 mb-1.5 block";
  const err = (m?: string) => m && <p className="mt-1 text-[11px] text-rose-400">{m}</p>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5 items-start">
      {/* coluna esquerda */}
      <div className="space-y-5">
        <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 sm:p-5 space-y-4">
          <h2 className="text-sm font-semibold tracking-tight">Informações da peça</h2>
          <div>
            <label className={lbl} htmlFor="name">Nome do produto</label>
            <input id="name" {...register("name")} placeholder="Ex: Polo Tech Black Zíper" className={inp} />
            <p className="mt-1.5 text-[10px] text-stone-600 truncate">/produtos/<span className="text-amber-500/80">{slugPreview}</span></p>
            {err(errors.name?.message)}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={lbl} htmlFor="price">Preço (R$)</label>
              <input id="price" type="number" step="0.10" min="0" {...register("price")} placeholder="89.90" className={`${inp} tabular-nums`} />
              {err(errors.price?.message)}
            </div>
            <div>
              <label className={lbl} htmlFor="oldPrice">Preço comparativo</label>
              <input id="oldPrice" type="number" step="0.10" min="0" {...register("oldPrice")} placeholder="119.90" className={`${inp} tabular-nums`} />
            </div>
            <div>
              <label className={lbl} htmlFor="category">Categoria</label>
              <select id="category" {...register("category")} className={inp}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={lbl} htmlFor="description">Descrição</label>
            <textarea id="description" rows={3} {...register("description")}
              placeholder="Tecido, caimento, detalhes de acabamento..."
              className="w-full rounded-lg border border-stone-800 bg-stone-900 px-3.5 py-3 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors resize-none"
            />
          </div>
          <label className="flex items-center justify-between rounded-lg border border-stone-800 bg-stone-950/60 px-4 h-12 cursor-pointer">
            <span className="text-sm font-medium">Produto ativo no catálogo</span>
            <input type="checkbox" {...register("isActive")} className="sr-only peer" />
            <span className="h-6 w-11 rounded-full bg-stone-800 border border-stone-700 relative transition-colors peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500/50
              after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-1 after:h-[18px] after:w-[18px] after:rounded-full after:bg-stone-500 after:transition-all
              peer-checked:after:left-[calc(100%-1.35rem)] peer-checked:after:bg-emerald-400" />
          </label>
        </section>

        <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 sm:p-5">
          <h2 className="text-sm font-semibold tracking-tight mb-4">Grade &amp; estoque</h2>
          <div className="flex flex-wrap items-end gap-2 mb-4">
            <div>
              <label className={lbl} htmlFor="fill">Preencher todos com</label>
              <input id="fill" type="number" min="0" value={fillAll} onChange={(e) => setFillAll(e.target.value)}
                placeholder="ex: 5" className="h-11 w-28 rounded-lg border border-dashed border-stone-700 bg-stone-950 px-3 text-center text-sm tabular-nums outline-none focus:border-amber-500/50" />
            </div>
            <button type="button" onClick={setStockAll}
              className="h-11 px-4 inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-semibold hover:bg-amber-500/15 transition-colors active:scale-[0.98]">
              <WandSparkles {...sw} className="w-4 h-4" /> Aplicar na grade
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {SIZES.map((size, i) => (
              <div key={size} className="rounded-lg border border-stone-800 bg-stone-950/60 p-3 text-center">
                <p className="text-[11px] font-bold text-amber-400 mb-2">{size}</p>
                <input
                  type="number" min="0" max="999"
                  {...register(`variants.${i}.stock`, { valueAsNumber: true })}
                  className="h-11 w-full rounded-md border border-stone-800 bg-stone-900 text-center text-sm font-semibold tabular-nums outline-none focus:border-amber-500/50"
                />
              </div>
            ))}
          </div>
          {err(typeof errors.variants?.message === "string" ? errors.variants.message : undefined)}
        </section>
      </div>

      {/* coluna direita — fotos + submit */}
      <div className="space-y-5 xl:sticky xl:top-24">
        <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 sm:p-5">
          <h2 className="text-sm font-semibold tracking-tight mb-1">Fotos do produto</h2>
          <p className="text-[11px] text-stone-500 mb-4">
            A primeira foto é a capa. Arraste para reordenar.
          </p>

          <ul className="space-y-2 mb-3">
            {images.map((url, i) => (
              <li
                key={`${url}-${i}`}
                draggable
                onDragStart={() => setDragIdx(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { if (dragIdx !== null) reorder(dragIdx, i); setDragIdx(null); }}
                onDragEnd={() => setDragIdx(null)}
                className={`flex items-center gap-2 rounded-lg border p-2 cursor-grab active:cursor-grabbing transition-colors ${
                  dragIdx === i ? "border-amber-500/50 bg-amber-500/5" : "border-stone-800 hover:border-stone-700"
                }`}
              >
                <GripVertical {...sw} className="w-4 h-4 text-stone-600 shrink-0" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-12 h-12 rounded-md object-cover border border-stone-800 shrink-0" />
                <div className="min-w-0 flex-1">
                  {i === 0 && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5 mb-0.5">
                      <Star {...sw} className="w-2.5 h-2.5" /> Capa
                    </span>
                  )}
                  <p className="text-[10px] text-stone-600 truncate">{url.replace(/^https:\/\/images\.unsplash\.com\//, "unsplash / ")}</p>
                </div>
                {i !== 0 && (
                  <button type="button" title="Definir como capa" onClick={() => reorder(i, 0)}
                    className="h-8 w-8 grid place-items-center rounded-md text-stone-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                    <Star {...sw} className="w-3.5 h-3.5" />
                  </button>
                )}
                <button type="button" title="Remover"
                  onClick={() => syncImages(images.filter((_, x) => x !== i))}
                  className="h-8 w-8 grid place-items-center rounded-md text-stone-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                  <Trash2 {...sw} className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file" accept="image/*" multiple onChange={handleFileUpload}
              className="hidden"
            />
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="h-11 px-3.5 inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/15 transition-colors active:scale-[0.98]">
              <ImagePlus {...sw} className="w-4 h-4" /> Enviar imagem
            </button>
            <input
              value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(urlDraft); } }}
              placeholder="Ou cole uma URL"
              className="h-11 flex-1 min-w-0 rounded-lg border border-stone-800 bg-stone-900 px-3.5 text-xs text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors"
            />
            <button type="button" onClick={() => addImage(urlDraft)}
              className="h-11 px-3.5 inline-flex items-center gap-1.5 rounded-lg border border-stone-700 hover:border-amber-500/40 text-xs font-semibold text-stone-300 hover:text-amber-400 transition-colors active:scale-[0.98]">
              <ImagePlus {...sw} className="w-4 h-4" /> URL
            </button>
          </div>
          <div className="flex gap-1.5 mt-2">
            {EXAMPLE_SEEDS.map((seed) => (
              <button key={seed} type="button"
                onClick={() => addImage(`https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=900&q=85`)}
                className="flex-1 h-14 rounded-lg overflow-hidden border border-stone-800 hover:border-amber-500/40 opacity-70 hover:opacity-100 transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=200&q=60`} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          {err(errors.images?.message as string | undefined)}
        </section>

        <button
          type="submit" disabled={saving}
          className="h-12 w-full rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold text-sm inline-flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98]"
        >
          {saving && <Loader2 {...sw} className="w-4 h-4 animate-spin" />}
          {productId ? "Salvar alterações" : "Publicar produto"}
        </button>
      </div>
    </form>
  );
}
