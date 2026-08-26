"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, ReceiptText, Settings,
  Store, LogOut, Menu, X, Users, GitBranch, MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { logoutAction } from "@/lib/actions/admin.actions";

const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/admin/pedidos", label: "Pedidos", icon: ReceiptText },
  { href: "/admin/comunicacoes", label: "Comunicações", icon: MessageSquare },
  { href: "/admin/configuracoes", label: "Config.", icon: Settings },
];

const MOBILE_NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/admin/pedidos", label: "Pedidos", icon: ReceiptText },
  { href: "/admin/configuracoes", label: "Config.", icon: Settings },
];

const TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard CRM",
  "/admin/clientes": "Clientes",
  "/admin/pipeline": "Pipeline de Vendas",
  "/admin/produtos": "Produtos & Catálogo",
  "/admin/produtos/novo": "Novo Produto",
  "/admin/pedidos": "Pedidos & Comandas",
  "/admin/comunicacoes": "Comunicações",
  "/admin/configuracoes": "Configurações da Loja",
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const title =
    TITLES[pathname] ??
    (pathname.startsWith("/admin/produtos/") ? "Editar Produto" : "Painel");

  const isActive = (href: string) => pathname.startsWith(href);
  const iconCls = "w-[18px] h-[18px]";
  const sw = { strokeWidth: 1.5 } as const;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-60 flex-col border-r border-stone-800/80 bg-stone-900/40 backdrop-blur-sm z-40">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-stone-800/80">
          <div className="w-9 h-9 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center justify-center">
            <span className="text-amber-400 font-bold text-xs tracking-wider">EP</span>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-sm tracking-tight">Estilo Prime</p>
            <p className="text-stone-500 text-[10px] uppercase tracking-widest">Painel Admin</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`h-11 px-4 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors duration-150 active:scale-[0.98] ${
                isActive(href)
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/25"
                  : "text-stone-400 hover:text-stone-100 hover:bg-stone-800/50 border border-transparent"
              }`}
            >
              <Icon {...sw} className={iconCls} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-stone-800/80 space-y-1">
          <a
            href="/" target="_blank"
            className="h-11 px-4 rounded-lg flex items-center gap-3 text-sm font-medium text-stone-400 hover:text-stone-100 hover:bg-stone-800/50 transition-colors duration-150"
          >
            <Store {...sw} className={iconCls} /> Ver loja
          </a>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full h-11 px-4 rounded-lg flex items-center gap-3 text-sm font-medium text-stone-500 hover:text-rose-400 hover:bg-rose-500/5 transition-colors duration-150 active:scale-[0.98]"
            >
              <LogOut {...sw} className={iconCls} /> Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-30 h-16 flex items-center gap-3 px-4 sm:px-6 border-b border-stone-800/80 bg-stone-950/85 backdrop-blur-md lg:pl-[17rem]">
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden h-11 w-11 -ml-2 grid place-items-center rounded-lg text-stone-300 hover:bg-stone-800/70 active:scale-[0.98] transition-all duration-150"
          aria-label="Menu"
        >
          {mobileOpen ? <X {...sw} className="w-5 h-5" /> : <Menu {...sw} className="w-5 h-5" />}
        </button>
        <div className="min-w-0">
          <h1 className="font-bold tracking-tight text-base sm:text-lg truncate">{title}</h1>
        </div>
        <span className="ml-auto hidden sm:inline-flex items-center gap-1.5 text-[11px] text-stone-500 border border-stone-800 rounded-full px-3 h-7">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
           Balcão · Estilo Prime
        </span>
      </header>

      {/* Drawer mobile */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40" role="dialog">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="absolute top-16 inset-x-3 rounded-xl border border-stone-800 bg-stone-900 shadow-2xl p-2 space-y-1">
            {[...NAV, { href: "/", label: "Ver loja", icon: Store }].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`h-11 px-4 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${
                  isActive(href) && href !== "/"
                    ? "bg-amber-500/10 text-amber-400"
                    : "text-stone-300 active:bg-stone-800"
                }`}
              >
                <Icon {...sw} className={iconCls} /> {label}
              </Link>
            ))}
            <form action={logoutAction}>
              <button type="submit" className="w-full h-11 px-4 rounded-lg flex items-center gap-3 text-sm font-medium text-stone-400 hover:text-rose-400 transition-colors">
                <LogOut {...sw} className={iconCls} /> Sair
              </button>
            </form>
          </nav>
        </div>
      )}

      <main className="lg:pl-60 px-4 sm:px-6 py-6 pb-24 lg:pb-10 max-w-[1400px]">{children}</main>

      {/* Bottom nav mobile-first */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-stone-800/80 bg-stone-950/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5">
          {MOBILE_NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`h-14 min-h-11 flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors duration-150 active:scale-[0.98] ${
                isActive(href) ? "text-amber-400" : "text-stone-500"
              }`}
            >
              <Icon {...sw} className={iconCls} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
