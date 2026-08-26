"use client";

import { useEffect } from "react";

export default function RootPage() {
  useEffect(() => {
    window.location.replace("/site.html");
  }, []);
  return (
    <div className="min-h-screen grid place-items-center bg-[#0a0a0a] text-white">
      <p className="text-stone-400 text-sm">Redirecionando para a loja...</p>
      <a href="/site.html" className="mt-4 text-amber-400 underline">Clique aqui se não for redirecionado</a>
    </div>
  );
}
