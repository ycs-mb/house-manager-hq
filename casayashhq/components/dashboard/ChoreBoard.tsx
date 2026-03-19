"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChoreEntry } from "@/types";

type Props = {
  chores: ChoreEntry[];
};

const COLUMNS: ChoreEntry["status"][] = ["To Do", "In Progress", "Done"];

const columnStyles: Record<ChoreEntry["status"], { header: string; bg: string }> = {
  "To Do": { header: "text-slate-700", bg: "bg-slate-50" },
  "In Progress": { header: "text-purple-700", bg: "bg-purple-50/50" },
  Done: { header: "text-green-700", bg: "bg-green-50/50" },
};

const frequencyColors: Record<ChoreEntry["frequency"], string> = {
  Daily: "bg-blue-50 text-blue-700 border-blue-200",
  Weekly: "bg-green-50 text-green-700 border-green-200",
  Monthly: "bg-amber-50 text-amber-700 border-amber-200",
  Seasonal: "bg-purple-50 text-purple-700 border-purple-200",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ChoreBoard({ chores }: Props) {
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [frequencyFilter, setFrequencyFilter] = useState<string>("all");

  const filtered = chores.filter((c) => {
    if (assigneeFilter !== "all" && c.assignee !== assigneeFilter) return false;
    if (frequencyFilter !== "all" && c.frequency !== frequencyFilter) return false;
    return true;
  });

  const byStatus = (status: ChoreEntry["status"]) =>
    filtered.filter((c) => c.status === status);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={assigneeFilter} onValueChange={(v) => setAssigneeFilter(v ?? "all")}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="You">You</SelectItem>
            <SelectItem value="Partner">Partner</SelectItem>
          </SelectContent>
        </Select>

        <Select value={frequencyFilter} onValueChange={(v) => setFrequencyFilter(v ?? "all")}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue placeholder="Frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Frequencies</SelectItem>
            <SelectItem value="Daily">Daily</SelectItem>
            <SelectItem value="Weekly">Weekly</SelectItem>
            <SelectItem value="Monthly">Monthly</SelectItem>
            <SelectItem value="Seasonal">Seasonal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((status) => {
          const cards = byStatus(status);
          const styles = columnStyles[status];
          return (
            <div
              key={status}
              className={cn("rounded-xl border p-3", styles.bg)}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className={cn("text-xs font-semibold uppercase tracking-wide", styles.header)}>
                  {status}
                </h3>
                <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-muted-foreground border">
                  {cards.length}
                </span>
              </div>

              <div className="space-y-2">
                {cards.length === 0 ? (
                  <p className="px-1 py-4 text-center text-xs text-muted-foreground/60">
                    No tasks
                  </p>
                ) : (
                  cards.map((chore) => (
                    <Card key={chore.id} className="border bg-white shadow-sm">
                      <CardContent className="p-3 space-y-2">
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {chore.task}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn("text-xs", frequencyColors[chore.frequency])}
                          >
                            {chore.frequency}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {chore.assignee}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(chore.dueDate)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
