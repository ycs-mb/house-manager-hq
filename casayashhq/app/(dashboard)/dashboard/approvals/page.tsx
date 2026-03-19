import ApprovalCard from "@/components/dashboard/ApprovalCard";
import type { ApprovalRequest } from "@/types";

async function getApprovals(): Promise<ApprovalRequest[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/approvals`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ApprovalsPage() {
  const approvals = await getApprovals();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pending and resolved agent approval requests.
        </p>
      </div>

      {approvals.length === 0 ? (
        <div className="flex items-center justify-center rounded-xl border bg-card py-16">
          <p className="text-sm text-muted-foreground">No approval requests found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {approvals.map((approval) => (
            <ApprovalCard key={approval.id} approval={approval} />
          ))}
        </div>
      )}
    </div>
  );
}
