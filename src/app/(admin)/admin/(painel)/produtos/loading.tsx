export default function LoadingProdutos() {
  return (
    <div className="space-y-4">
      <div className="h-11 w-44 rounded-lg shimmer" />
      <div className="h-11 rounded-lg shimmer" />
      <div className="rounded-xl overflow-hidden border border-stone-800">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-[76px] border-b border-stone-800 last:border-0 relative overflow-hidden shimmer-bg" />
        ))}
      </div>
    </div>
  );
}
