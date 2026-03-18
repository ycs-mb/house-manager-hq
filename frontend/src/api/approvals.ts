const BASE = '/api'

export interface Approval {
  id: string
  run_id: string
  task_id: string
  status: 'pending' | 'approved' | 'rejected'
  comment: string | null
  decided_at: string | null
  created_at: string
  task_title: string | null
}

export interface ApprovalDecision {
  decision: 'approved' | 'rejected'
  comment?: string
}

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchApprovals(status?: string): Promise<Approval[]> {
  const params = status ? `?status=${status}` : ''
  const res = await fetch(`${BASE}/approvals${params}`, { headers: authHeader() })
  if (!res.ok) throw new Error('Failed to fetch approvals')
  return res.json()
}

export async function decideApproval(id: string, payload: ApprovalDecision): Promise<Approval> {
  const res = await fetch(`${BASE}/approvals/${id}/decide`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to submit decision')
  return res.json()
}
