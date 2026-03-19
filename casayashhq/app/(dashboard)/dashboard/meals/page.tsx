import MealPlanTable from "@/components/dashboard/MealPlanTable";
import type { MealEntry } from "@/types";

async function getMeals(): Promise<MealEntry[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/notion/meals`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function MealsPage() {
  const meals = await getMeals();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Meal Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Weekly meal schedule with recipes, prep time, and calorie info.
        </p>
      </div>
      <MealPlanTable meals={meals} />
    </div>
  );
}
