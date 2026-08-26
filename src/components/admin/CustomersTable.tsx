"use client";

import { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Search, X, Users } from "lucide-react";
import type { CustomerT } from "@/lib/db/store";
import { deleteCustomerAction } from "@/lib/actions/admin.actions";
import { brl, fmtDateTime } from "@/lib/admin/format";
import CustomerFormDialog from "./CustomerFormDialog";
import CustomerProfileDialog from "./CustomerProfileDialog";

const sw = { strokeWidth: 1.5 } as const;

const ALL_TAGS = ["VIP", "Fiel", "Atacado", "Balcão", "Indicação", "Instagram"];

export default function CustomersTable({ customers }: { customers: CustomerT[] }) {
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [pending, start] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = customers;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    if (tagFilter) {
      list = list.filter((c) => c.tags.includes(tagFilter));
    }
    return list;
  }, [customers, search, tagFilter]);

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Excluir cliente "${name}"?`)) return;
    setDeletingId(id);
    start(async () => {
      try {
        await deleteCustomerAction(id);
        toast.success("Cliente excluído");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Erro ao excluir");
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            {...sw}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone ou e-mail..."
            className="h-11 w-full rounded-lg border border-stone-800 bg-stone-900 pl-9 pr-3 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
            >
              <X {...sw} className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="h-11 min-h-11 rounded-lg border border-stone-800 bg-stone-900 px-3 text-xs text-stone-200 outline-none focus:border-amber-500/50 transition-colors"
          aria-label="Filtrar por tag"
        >
          <option value="">Todas tags</option>
          {ALL_TAGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-stone-800 bg-stone-900/60 overflow-x-auto">
        <table className="w-full min-w-[950px] text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-stone-500 border-b border-stone-800">
              <th className="p-4 font-medium">Nome</th>
              <th className="p-4 font-medium">Telefone</th>
              <th className="p-4 font-medium">Cidade</th>
              <th className="p-4 font-medium">Pedidos</th>
              <th className="p-4 font-medium">Total Gasto</th>
              <th className="p-4 font-medium">Último Pedido</th>
              <th className="p-4 font-medium">Tags</th>
              <th className="p-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800/70">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-stone-800/25 transition-colors align-top">
                <td className="p-3.5 min-h-11">
                  <CustomerProfileDialog customer={c}>
                    <button className="font-medium text-stone-100 hover:text-amber-400 transition-colors text-left cursor-pointer">
                      {c.name}
                    </button>
                  </CustomerProfileDialog>
                  {c.email && (
                    <p className="text-[11px] text-stone-500 truncate max-w-[180px]">{c.email}</p>
                  )}
                </td>
                <td className="p-3.5 tabular-nums text-stone-300">
                  <a href={`tel:+55${c.phone}`} className="hover:text-amber-400 transition-colors">
                    {c.phone}
                  </a>
                </td>
                <td className="p-3.5 text-stone-400">{c.city || "—"}</td>
                <td className="p-3.5 tabular-nums font-semibold text-stone-200">
                  {c.totalOrders}
                </td>
                <td className="p-3.5 tabular-nums font-semibold text-stone-200">
                  {brl(c.totalSpent)}
                </td>
                <td className="p-3.5 text-[11px] text-stone-500 tabular-nums whitespace-nowrap">
                  {c.lastOrderAt ? fmtDateTime(c.lastOrderAt) : "—"}
                </td>
                <td className="p-3.5">
                  <div className="flex flex-wrap gap-1">
                    {c.tags.length > 0 ? (
                      c.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-400 whitespace-nowrap"
                        >
                          {t}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-stone-600">—</span>
                    )}
                  </div>
                </td>
                <td className="p-3.5">
                  <div className="flex items-center justify-end gap-1.5">
                    <CustomerFormDialog customer={c}>
                      <button
                        title="Editar cliente"
                        className="h-9 w-9 grid place-items-center rounded-lg border border-stone-800 text-stone-400 hover:text-amber-400 hover:border-amber-500/40 transition-colors active:scale-[0.98]"
                      >
                        <Pencil {...sw} className="w-4 h-4" />
                      </button>
                    </CustomerFormDialog>
                    <button
                      title="Excluir cliente"
                      onClick={() => handleDelete(c.id, c.name)}
                      disabled={deletingId === c.id}
                      className="h-9 w-9 grid place-items-center rounded-lg border border-stone-800 text-stone-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors active:scale-[0.98] disabled:opacity-40"
                    >
                      <Trash2 {...sw} className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-14 text-center">
            <Users {...sw} className="w-10 h-10 text-stone-700 mx-auto mb-3" />
            <p className="text-sm text-stone-500">
              {search || tagFilter
                ? "Nenhum cliente encontrado com esses filtros."
                : "Nenhum cliente cadastrado ainda."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
