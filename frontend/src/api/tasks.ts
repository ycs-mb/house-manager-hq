const BASE = '/api'

export type TaskStatus = 'pending' | 'in_progress' | 'in_review' | 'done' | 'failed'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface RunSummary {
  id: string
  status: string
  github_pr_url: string | null
  output_log: string | null
  tokens_used: number | null
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  github_repo: string | null
  created_at: string
  updated_at: string
  latest_run: RunSummary | null
}

export interface CreateTaskPayload {
  title: string
  description?: string
  priority?: TaskPriority
  github_repo?: string
}

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('access_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchTasks(status?: TaskStatus): Promise<Task[]> {
  const params = status ? `?status=${status}` : ''
  const res = await fetch(`${BASE}/tasks${params}`, { headers: authHeader() })
  if (!res.ok) throw new Error('Failed to fetch tasks')
  return res.json()
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const res = await fetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create task')
  return res.json()
}

export async function getTask(id: string): Promise<Task> {
  const res = await fetch(`${BASE}/tasks/${id}`, { headers: authHeader() })
  if (!res.ok) throw new Error('Task not found')
  return res.json()
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const res = await fetch(`${BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error('Failed to update task')
  return res.json()
}
