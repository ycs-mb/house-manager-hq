"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ApprovalRequest } from "@/types";

type AgentColors = {
  bg: string;
  text: string;
  dot: string;
};

const agentColorMap: Record<string, AgentColors> = {
  "claude-code": {
    bg: "bg-blue-50",
    text: "text-[#2E75B6]",
    dot: "bg-[#2E75B6]",
  },
  codex: {
    bg: "bg-green-50",
    text: "text-[#16A34A]",
    dot: "bg-[#16A34A]",
  },
  zeroclaw: {
    bg: "bg-amber-50",
    text: "text-[#D97706]",
    dot: "bg-[#D97706]",
  },
};

type ApprovalCardProps = {
  approval: ApprovalRequest;
  onUpdate?: (id: string, status: "approved" | "rejected") => void;
};

export default function ApprovalCard({ approval, onUpdate }: ApprovalCardProps) {
  const [optimisticStatus, setOptimisticStatus] = useState<
    ApprovalRequest["status"]
  >(approval.status);
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const colors =
    agentColorMap[approval.agentName] ?? agentColorMap["claude-code"];
  const isPending = optimisticStatus === "pending";

  async function handleAction(action: "approve" | "reject") {
    if (!isPending) return;
    setLoading(action);
    const newStatus = action === "approve" ? "approved" : "rejected";
    setOptimisticStatus(newStatus);

    try {
      const res = await fetch(`/api/approvals/${approval.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      toast.success(
        action === "approve" ? "Request approved" : "Request rejected",
      );
      onUpdate?.(approval.id, newStatus);
    } catch {
      setOptimisticStatus(approval.status);
      toast.error("Failed to update approval. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card
      className={cn(
        "border transition-all",
        optimisticStatus === "approved" && "border-green-200 bg-green-50/30",
        optimisticStatus === "rejected" && "border-red-200 bg-red-50/30",
        optimisticStatus === "pending" && "border-border",
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                colors.bg,
                colors.text,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", colors.dot)} />
              {approval.agentName}
            </div>
            <Badge variant="outline" className="text-xs">
              {approval.requestType}
            </Badge>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-medium",
              optimisticStatus === "approved" &&
                "border-green-200 bg-green-100 text-green-800",
              optimisticStatus === "rejected" &&
                "border-red-200 bg-red-100 text-red-800",
              optimisticStatus === "pending" &&
                "border-amber-200 bg-amber-100 text-amber-800",
            )}
          >
            {optimisticStatus}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm font-medium text-foreground">
          {approval.description}
        </p>
        {approval.context && (
          <p className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            {approval.context}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {new Date(approval.createdAt).toLocaleString()}
        </p>

        {isPending && (
          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              className="flex-1 bg-green-600 text-white hover:bg-green-700"
              onClick={() => handleAction("approve")}
              disabled={loading !== null}
            >
              {loading === "approve" ? "Approving…" : "Approve"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => handleAction("reject")}
              disabled={loading !== null}
            >
              {loading === "reject" ? "Rejecting…" : "Reject"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
