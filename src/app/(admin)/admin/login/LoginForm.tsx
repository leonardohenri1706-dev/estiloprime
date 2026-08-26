"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck, Store } from "lucide-react";
import { loginSubmit } from "@/lib/actions/admin-auth.actions";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        try {
          const res = await loginSubmit(new FormData(e.currentTarget));
          if (res && "error" in res && res.error) setError(res.error);
        } catch {
          setError("Falha de conexão");
        }
        setPending(false);
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="email" className="text-xs font-medium text-stone-400">E-mail</label>
        <input
          id="email" name="email" type="email" required autoComplete="username"
          defaultValue="admin@estiloprime.store"
          className="mt-1.5 h-11 w-full rounded-lg border border-stone-800 bg-stone-900 px-3.5 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/15 transition"
        />
      </div>
      <div>
        <label htmlFor="password" className="text-xs font-medium text-stone-400">Senha</label>
        <input
          id="password" name="password" type="password" required autoComplete="current-password"
          defaultValue="prime2026"
          className="mt-1.5 h-11 w-full rounded-lg border border-stone-800 bg-stone-900 px-3.5 text-sm text-stone-100 placeholder:text-stone-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/15 transition"
        />
      </div>

      {error && (
        <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/25 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit" disabled={pending}
        className="h-11 w-full rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 active:scale-[0.98]"
      >
        {pending ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} /> : <ShieldCheck strokeWidth={1.5} className="w-4 h-4" />}
        {pending ? "Entrando..." : "Entrar no painel"}
      </button>

      <p className="text-center text-[11px] text-stone-600">
        Demo: admin@estiloprime.store · prime2026
      </p>

      <Link href="/" className="flex items-center justify-center gap-1.5 text-[11px] text-stone-500 hover:text-amber-400 transition-colors pt-1">
        <Store strokeWidth={1.5} className="w-3.5 h-3.5" /> voltar para a loja
      </Link>
    </form>
  );
}
