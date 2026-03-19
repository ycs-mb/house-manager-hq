export default function ApprovalsLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-28 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-60 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-24 rounded-full bg-muted animate-pulse" />
                <div className="h-5 w-20 rounded-full bg-muted animate-pulse" />
              </div>
              <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
            </div>
            <div className="h-4 w-full rounded bg-muted animate-pulse" />
            <div className="h-12 w-full rounded-md bg-muted animate-pulse" />
            <div className="h-3 w-32 rounded bg-muted animate-pulse" />
            <div className="flex gap-2">
              <div className="h-8 flex-1 rounded-md bg-muted animate-pulse" />
              <div className="h-8 flex-1 rounded-md bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
