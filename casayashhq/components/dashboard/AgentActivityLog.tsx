"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { cn } from "@/lib/utils";
import type { ActivityEntry, Agent } from "@/types";

type Props = {
  activities: ActivityEntry[];
};

const agentColors: Record<Agent, { bg: string; text: string; dot: string }> = {
  "claude-code": { bg: "bg-blue-50", text: "text-[#2E75B6]", dot: "bg-[#2E75B6]" },
  codex: { bg: "bg-green-50", text: "text-[#16A34A]", dot: "bg-[#16A34A]" },
  zeroclaw: { bg: "bg-amber-50", text: "text-[#D97706]", dot: "bg-[#D97706]" },
};

const agentLabels: Record<Agent, string> = {
  "claude-code": "Claude Code",
  codex: "Codex",
  zeroclaw: "ZeroClaw",
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AgentActivityLog({ activities }: Props) {
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const now = new Date();
  const filtered = activities.filter((a) => {
    if (agentFilter !== "all" && a.agent !== agentFilter) return false;
    if (dateFilter !== "all") {
      const ts = new Date(a.timestamp);
      const diffHours = (now.getTime() - ts.getTime()) / (1000 * 60 * 60);
      if (dateFilter === "24h" && diffHours > 24) return false;
      if (dateFilter === "7d" && diffHours > 168) return false;
      if (dateFilter === "30d" && diffHours > 720) return false;
    }
    return true;
  });

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header + Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b">
        <h2 className="text-base font-semibold text-foreground">Agent Activity</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={agentFilter} onValueChange={(v) => setAgentFilter(v ?? "all")}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="All Agents" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              <SelectItem value="claude-code">Claude Code</SelectItem>
              <SelectItem value="codex">Codex</SelectItem>
              <SelectItem value="zeroclaw">ZeroClaw</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v ?? "all")}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          No activity found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground w-32">
                  Agent
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Action
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground w-40">
                  Timestamp
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28 text-right">
                  Token Cost
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground w-24">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry, idx) => {
                const colors = agentColors[entry.agent];
                return (
                  <TableRow key={idx} className="hover:bg-muted/30">
                    <TableCell className="py-3">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                          colors.bg,
                          colors.text,
                        )}
                      >
                        <span
                          className={cn("h-1.5 w-1.5 rounded-full shrink-0", colors.dot)}
                        />
                        {agentLabels[entry.agent]}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-sm text-foreground">
                      {entry.action}
                    </TableCell>
                    <TableCell className="py-3 text-xs text-muted-foreground">
                      {formatTimestamp(entry.timestamp)}
                    </TableCell>
                    <TableCell className="py-3 text-right text-xs font-mono text-muted-foreground">
                      {entry.tokenCost.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3">
                      <StatusBadge status={entry.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
