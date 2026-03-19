import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink, Clock, Flame } from "lucide-react";
import type { MealEntry } from "@/types";

type Props = {
  meals: MealEntry[];
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner"] as const;

const mealTypeBadgeStyles: Record<string, string> = {
  Breakfast: "bg-amber-50 text-amber-700 border-amber-200",
  Lunch: "bg-green-50 text-green-700 border-green-200",
  Dinner: "bg-blue-50 text-blue-700 border-blue-200",
  Snack: "bg-purple-50 text-purple-700 border-purple-200",
};

function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export default function MealPlanTable({ meals }: Props) {
  // Group meals by day label then by meal type
  const grid: Record<string, Record<string, MealEntry>> = {};
  for (const meal of meals) {
    const day = getDayLabel(meal.date);
    if (!grid[day]) grid[day] = {};
    grid[day][meal.mealType] = meal;
  }

  // Determine days to show (up to 7)
  const days = meals.length > 0
    ? [...new Set(meals.map((m) => getDayLabel(m.date)))]
    : DAYS;

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h2 className="text-base font-semibold text-foreground">Weekly Meal Plan</h2>
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium text-[#2E75B6] hover:underline"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Grocery List
        </a>
      </div>

      {meals.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          No meal plan data available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Meal
                </TableHead>
                {days.map((day) => (
                  <TableHead
                    key={day}
                    className="text-xs font-semibold uppercase tracking-wide text-muted-foreground min-w-[140px]"
                  >
                    {day}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {MEAL_TYPES.map((mealType) => (
                <TableRow key={mealType}>
                  <TableCell className="align-top py-3">
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${mealTypeBadgeStyles[mealType]}`}
                    >
                      {mealType}
                    </Badge>
                  </TableCell>
                  {days.map((day) => {
                    const entry = grid[day]?.[mealType];
                    return (
                      <TableCell key={day} className="align-top py-3">
                        {entry ? (
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground leading-tight">
                              {entry.recipeName}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {entry.prepTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Flame className="h-3 w-3" />
                                {entry.calories} kcal
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
