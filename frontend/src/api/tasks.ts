export type TaskStatus = 'pending' | 'in_progress' | 'in_review' | 'done'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  created_at: string
  updated_at: string
}

export interface CreateTaskPayload {
  title: string
  description?: string
}

const BASE = '/api'

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${BASE}/tasks`)
  if (!res.ok) throw new Error('Failed to fetch tasks')
  return res.json()
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const res = await fetch(`${BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Failed to create task')
  return res.json()
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const res = await fetch(`${BASE}/tasks/${id}?status=${status}`, { method: 'PATCH' })
  if (!res.ok) throw new Error('Failed to update task')
  return res.json()
}
