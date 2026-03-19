"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BudgetEntry } from "@/types";

type Props = {
  budget: BudgetEntry[];
};

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function BudgetSummary({ budget }: Props) {
  const totalBudgeted = budget.reduce((sum, e) => sum + e.budgeted, 0);
  const totalActual = budget.reduce((sum, e) => sum + e.actual, 0);
  const totalVariance = totalBudgeted - totalActual;

  const kpis = [
    {
      label: "Total Budgeted",
      value: formatCurrency(totalBudgeted),
      sub: "planned spend",
      color: "text-[#2E75B6]",
      bg: "bg-blue-50",
    },
    {
      label: "Total Actual",
      value: formatCurrency(totalActual),
      sub: "actual spend",
      color: "text-slate-700",
      bg: "bg-slate-50",
    },
    {
      label: "Variance",
      value: formatCurrency(Math.abs(totalVariance)),
      sub: totalVariance >= 0 ? "under budget" : "over budget",
      color: totalVariance >= 0 ? "text-green-700" : "text-red-700",
      bg: totalVariance >= 0 ? "bg-green-50" : "bg-red-50",
      icon:
        totalVariance > 0 ? (
          <TrendingDown className="h-4 w-4 text-green-600" />
        ) : totalVariance < 0 ? (
          <TrendingUp className="h-4 w-4 text-red-500" />
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground" />
        ),
    },
  ];

  const chartData = budget.map((e) => ({
    category: e.category,
    Budgeted: e.budgeted,
    Actual: e.actual,
  }));

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={cn("border", kpi.bg)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {kpi.label}
                </p>
                {kpi.icon}
              </div>
              <p className={cn("mt-2 text-2xl font-bold", kpi.color)}>
                {kpi.value}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bar chart */}
      <Card className="border">
        <CardContent className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Budgeted vs Actual by Category
          </h3>
          {budget.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              No budget data available.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
                barCategoryGap="25%"
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v}`}
                />
                <Tooltip
                  formatter={(value) => typeof value === "number" ? formatCurrency(value) : String(value)}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                />
                <Bar
                  dataKey="Budgeted"
                  fill="#2E75B6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
                <Bar
                  dataKey="Actual"
                  fill="#D6E4F0"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
