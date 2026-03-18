import type { Task, TaskStatus } from '@/api/tasks'

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: '#94a3b8',
  in_progress: '#3b82f6',
  in_review: '#f59e0b',
  done: '#22c55e',
}

interface TaskCardProps {
  task: Task
  onStatusChange?: (id: string, status: TaskStatus) => void
}

export function TaskCard({ task, onStatusChange }: TaskCardProps) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>{task.title}</h3>
        <span
          style={{
            backgroundColor: STATUS_COLORS[task.status],
            color: 'white',
            padding: '2px 10px',
            borderRadius: 12,
            fontSize: 12,
          }}
        >
          {STATUS_LABELS[task.status]}
        </span>
      </div>
      {task.description && (
        <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 14 }}>{task.description}</p>
      )}
      {onStatusChange && task.status !== 'done' && (
        <button
          style={{ marginTop: 12, padding: '6px 12px', cursor: 'pointer' }}
          onClick={() => onStatusChange(task.id, getNextStatus(task.status))}
        >
          Move to {STATUS_LABELS[getNextStatus(task.status)]}
        </button>
      )}
    </div>
  )
}

function getNextStatus(current: TaskStatus): TaskStatus {
  const order: TaskStatus[] = ['pending', 'in_progress', 'in_review', 'done']
  const idx = order.indexOf(current)
  return order[Math.min(idx + 1, order.length - 1)]
}
