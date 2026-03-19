import AgentActivityLog from "@/components/dashboard/AgentActivityLog";
import type { ActivityEntry } from "@/types";

async function getActivity(): Promise<ActivityEntry[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/notion/activity`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const activities = await getActivity();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of all agent activity across Casa Yash HQ.
        </p>
      </div>
      <AgentActivityLog activities={activities} />
    </div>
  );
}
