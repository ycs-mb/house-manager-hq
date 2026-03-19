export default function MealsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-28 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b flex justify-between">
          <div className="h-5 w-36 rounded bg-muted animate-pulse" />
          <div className="h-5 w-28 rounded bg-muted animate-pulse" />
        </div>
        <div className="p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-6 w-20 rounded-full bg-muted animate-pulse shrink-0" />
              {Array.from({ length: 7 }).map((__, j) => (
                <div key={j} className="flex-1 space-y-1.5">
                  <div className="h-4 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
