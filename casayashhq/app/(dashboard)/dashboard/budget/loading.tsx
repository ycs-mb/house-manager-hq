export default function BudgetLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-20 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-2">
            <div className="h-3 w-24 rounded bg-muted animate-pulse" />
            <div className="h-8 w-28 rounded bg-muted animate-pulse" />
            <div className="h-3 w-16 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border p-5 space-y-4">
        <div className="h-4 w-48 rounded bg-muted animate-pulse" />
        <div className="h-72 w-full rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
  );
}
