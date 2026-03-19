import ChoreBoard from "@/components/dashboard/ChoreBoard";
import type { ChoreEntry } from "@/types";

async function getChores(): Promise<ChoreEntry[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/notion/chores`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ChoresPage() {
  const chores = await getChores();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Chores</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Household task board with assignees, frequency, and status tracking.
        </p>
      </div>
      <ChoreBoard chores={chores} />
    </div>
  );
}
