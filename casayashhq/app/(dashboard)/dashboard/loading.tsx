export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-32 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-64 rounded-lg bg-muted animate-pulse" />
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b">
          <div className="h-5 w-36 rounded bg-muted animate-pulse" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-6 w-24 rounded-full bg-muted animate-pulse" />
              <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
              <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
