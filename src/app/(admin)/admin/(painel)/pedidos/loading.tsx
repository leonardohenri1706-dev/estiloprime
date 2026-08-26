export default function LoadingPedidos() {
  return (
    <div className="space-y-3">
      <div className="h-5 w-52 rounded shimmer" />
      <div className="rounded-xl overflow-hidden border border-stone-800">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[68px] border-b border-stone-800 last:border-0 relative overflow-hidden shimmer-bg" />
        ))}
      </div>
    </div>
  );
}
