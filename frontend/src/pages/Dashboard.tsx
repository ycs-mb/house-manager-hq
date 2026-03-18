import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, createTask, updateTaskStatus } from '@/api/tasks'
import { TaskCard } from '@/components/TaskCard'
import type { TaskStatus } from '@/api/tasks'
import { useState } from 'react'

export function Dashboard() {
  const queryClient = useQueryClient()
  const [newTitle, setNewTitle] = useState('')

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  })

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setNewTitle('')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateTaskStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTitle.trim()) {
      createMutation.mutate({ title: newTitle.trim() })
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
      <h1 style={{ marginBottom: 8 }}>Agentic Platform</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>
        AI-native software execution — assign tasks, agents ship.
      </p>

      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Describe a task..."
          style={{ flex: 1, padding: '8px 12px', fontSize: 14, borderRadius: 6, border: '1px solid #e2e8f0' }}
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          style={{ padding: '8px 20px', borderRadius: 6, background: '#6366f1', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          {createMutation.isPending ? 'Creating...' : 'Create Task'}
        </button>
      </form>

      {isLoading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p style={{ color: '#94a3b8', textAlign: 'center', padding: 40 }}>
          No tasks yet. Create one above to get started.
        </p>
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={(id, status) => updateMutation.mutate({ id, status })}
          />
        ))
      )}
    </div>
  )
}
