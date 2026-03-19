import BudgetSummary from "@/components/dashboard/BudgetSummary";
import type { BudgetEntry } from "@/types";

async function getBudget(): Promise<BudgetEntry[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/notion/budget`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function BudgetPage() {
  const budget = await getBudget();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Budget</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monthly budget overview with KPIs and category breakdown.
        </p>
      </div>
      <BudgetSummary budget={budget} />
    </div>
  );
}
