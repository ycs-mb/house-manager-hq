export interface Run {
  id: string
  task_id: string
  status: string
  llm_messages: Array<{ role: string; content: string }> | null
  output_log: string | null
  github_pr_url: string | null
  tokens_used: number | null
  error_message: string | null
  started_at: string | null
  completed_at: string | null
  created_at: string
}

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getRun(id: string): Promise<Run> {
  const res = await fetch(`/api/runs/${id}`, { headers: authHeader() })
  if (!res.ok) throw new Error('Run not found')
  return res.json()
}
