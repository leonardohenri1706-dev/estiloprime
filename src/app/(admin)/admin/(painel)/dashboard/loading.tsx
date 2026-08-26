export default function LoadingDashboard() {
  return (
    <div className="space-y-5">
      <div className="h-11 w-40 rounded-lg bg-stone-900 shimmer" />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-stone-900 shimmer" />
        ))}
      </div>
      <div className="h-64 rounded-xl bg-stone-900 shimmer" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="h-52 rounded-xl bg-stone-900 shimmer" />
        <div className="h-52 rounded-xl bg-stone-900 shimmer" />
      </div>
    </div>
  );
}
