export default function ChoresLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-24 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-72 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="flex gap-3">
        <div className="h-8 w-36 rounded-md bg-muted animate-pulse" />
        <div className="h-8 w-36 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, col) => (
          <div key={col} className="rounded-xl border p-3 bg-muted/20">
            <div className="mb-3 h-4 w-20 rounded bg-muted animate-pulse" />
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, row) => (
                <div key={row} className="rounded-lg border bg-white p-3 space-y-2">
                  <div className="h-4 w-full rounded bg-muted animate-pulse" />
                  <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
                  <div className="flex justify-between">
                    <div className="h-3 w-14 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-14 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
