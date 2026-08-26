"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { brl } from "@/lib/admin/format";
import { CATEGORY_LABEL, type CategoryEnum } from "@/lib/schemas/admin.schema";

type Point = { day: string; revenue: number; orders: number };
type Cat = { key: CategoryEnum; value: number; color: string };
type Zone = { location: string; count: number; pct: number };

/* ================= Revenue Area + Line ================= */

export function RevenueChart({ series }: { series: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 220, PADX = 8, PADY = 26;

  const max = Math.max(...series.map((s) => s.revenue), 100);
  const pts = useMemo(
    () =>
      series.map((s, i) => ({
        x: PADX + (i * (W - PADX * 2)) / Math.max(series.length - 1, 1),
        y: H - PADY - (s.revenue / max) * (H - PADY * 2),
        ...s,
      })),
    [series, max]
  );

  const linePath = useMemo(() => {
    if (!pts.length) return "";
    return pts.reduce((acc, p, i, arr) => {
      if (i === 0) return `M${p.x},${p.y}`;
      const prev = arr[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `${acc} C${cx},${prev.y} ${cx},${p.y} ${p.x},${p.y}`;
    }, "");
  }, [pts]);

  const areaPath = `${linePath} L${pts.at(-1)?.x ?? 0},${H - PADY} L${pts[0]?.x ?? 0},${H - PADY} Z`;
  const active = hover !== null ? pts[hover] : null;

  return (
    <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 sm:p-5">
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold tracking-tight">Faturamento &amp; volume</h2>
        {active && (
          <div className="text-right">
            <p className="text-sm font-bold tabular-nums text-amber-400">{brl(active.revenue)}</p>
            <p className="text-[11px] text-stone-500">{active.orders} comanda(s)</p>
          </div>
        )}
      </header>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" role="img" aria-label="Gráfico de faturamento">
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity=".28" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PADX} x2={W - PADX} y1={PADY + f * (H - PADY * 2)} y2={PADY + f * (H - PADY * 2)} stroke="#292524" strokeDasharray="3 6" />
        ))}
        <path d={areaPath} fill="url(#revFill)" />
        <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

        {pts.map((p, i) =>
          i % Math.ceil(pts.length / 7) === 0 ? (
            <text key={i} x={p.x} y={H - 6} textAnchor="middle" fontSize="10" fill="#78716c">
              {p.day}
            </text>
          ) : null
        )}

        {active && (
          <g>
            <line x1={active.x} x2={active.x} y1={PADY - 8} y2={H - PADY} stroke="#f59e0b" strokeOpacity=".35" />
            <circle cx={active.x} cy={active.y} r="4.5" fill="#0c0a09" stroke="#fbbf24" strokeWidth="2" />
          </g>
        )}

        {pts.map((p, i) => (
          <rect
            key={i} x={p.x - 10} y={0} width={20} height={H} fill="transparent"
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
          />
        ))}
      </svg>
    </section>
  );
}

/* ================= Donut categorias ================= */

export function CategoryDonut({ data }: { data: Cat[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const R = 52, CIRC = 2 * Math.PI * R;
  let acc = 0;

  return (
    <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 sm:p-5 flex flex-col">
      <h2 className="text-sm font-semibold tracking-tight mb-4">Vendas por categoria</h2>
      <div className="flex items-center gap-5">
        <svg viewBox="0 0 140 140" className="w-32 h-32 shrink-0 -rotate-90" role="img" aria-label="Distribuição por categoria">
          <circle cx="70" cy="70" r={R} fill="none" stroke="#292524" strokeWidth="14" />
          {data.map((d) => {
            const frac = total ? d.value / total : 0;
            const dash = frac * CIRC;
            const el = (
              <circle
                key={d.key} cx="70" cy="70" r={R} fill="none"
                stroke={d.color} strokeWidth="14"
                strokeDasharray={`${dash} ${CIRC - dash}`}
                strokeDashoffset={-acc * CIRC} strokeLinecap="butt"
              />
            );
            acc += frac;
            return el;
          })}
        </svg>
        <ul className="flex-1 space-y-2 min-w-0">
          {data.slice(0, 5).map((d) => (
            <li key={d.key} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="truncate text-stone-300">{CATEGORY_LABEL[d.key]}</span>
              <span className="ml-auto tabular-nums font-semibold text-stone-100">
                {total ? Math.round((d.value / total) * 100) : 0}%
              </span>
            </li>
          ))}
          {!data.length && <li className="text-xs text-stone-500">Sem vendas no período.</li>}
        </ul>
      </div>
    </section>
  );
}

/* ================= Barras entregas regionais ================= */

export function ZoneBars({ data }: { data: Zone[] }) {
  return (
    <section className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 sm:p-5">
      <h2 className="text-sm font-semibold tracking-tight mb-4">Entregas por região</h2>
      <ul className="space-y-3">
        {data.map((z) => (
          <li key={z.location}>
            <div className="flex justify-between items-baseline text-xs mb-1">
              <span className="text-stone-300 truncate">{z.location}</span>
              <span className="tabular-nums text-stone-400 font-medium">{z.count} · {z.pct}%</span>
            </div>
            <div className="h-2 rounded-full bg-stone-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
                style={{ width: `${Math.max(z.pct, 3)}%` }}
              />
            </div>
          </li>
        ))}
        {!data.length && <li className="text-xs text-stone-500">Sem entregas no período.</li>}
      </ul>
    </section>
  );
}

/* ================= Range switcher ================= */

export function RangeSwitch({ current }: { current: 7 | 30 }) {
  const btn =
    "h-9 min-h-11 lg:min-h-0 px-3.5 rounded-lg text-xs font-semibold transition-all duration-150 active:scale-[0.98]";
  return (
    <div className="inline-flex p-1 rounded-lg border border-stone-800 bg-stone-900">
      {([7, 30] as const).map((r) => (
        <Link
          key={r} href={`/admin/dashboard?range=${r}`} scroll={false}
          className={`${btn} ${
            current === r
              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              : "text-stone-400 hover:text-stone-200 border border-transparent"
          }`}
        >
          {r === 7 ? "7 dias" : "30 dias"}
        </Link>
      ))}
    </div>
  );
}
