import Link from "next/link";
import { Store } from "lucide-react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Login · Estilo Prime Admin" };

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center bg-stone-950 text-stone-100 px-4 relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          background:
            "radial-gradient(600px 300px at 80% -10%, rgba(245,158,11,.12), transparent 60%), radial-gradient(500px 280px at -5% 110%, rgba(245,158,11,.08), transparent 55%)",
        }}
      />
      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl border border-stone-800 bg-stone-900/60 backdrop-blur p-6 sm:p-8 shadow-xl shadow-black/40">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg border border-amber-500/30 bg-amber-500/10 grid place-items-center">
              <span className="text-amber-400 font-bold text-xs tracking-wider">EP</span>
            </div>
            <div>
              <h1 className="font-bold tracking-tight leading-none">Estilo Prime</h1>
              <p className="text-[10px] uppercase tracking-widest text-stone-500 mt-1">
                Acesso do lojista
              </p>
            </div>
          </div>
          <LoginForm />
        </div>
        <Link
          href="/"
          className="mt-4 mx-auto w-fit flex items-center gap-1.5 text-[11px] text-stone-500 hover:text-amber-400 transition-colors"
        >
          <Store strokeWidth={1.5} className="w-3.5 h-3.5" /> voltar para a loja
        </Link>
      </div>
    </main>
  );
}
