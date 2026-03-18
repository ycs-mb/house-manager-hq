import { Link } from 'react-router-dom'
import type { Task } from '@/api/tasks'
import clsx from 'clsx'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-slate-700 text-slate-300' },
  in_progress: { label: 'In Progress', className: 'bg-blue-500/20 text-blue-400' },
  in_review: { label: 'In Review', className: 'bg-amber-500/20 text-amber-400' },
  done: { label: 'Done', className: 'bg-emerald-500/20 text-emerald-400' },
  failed: { label: 'Failed', className: 'bg-red-500/20 text-red-400' },
}

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low: { label: 'Low', className: 'text-slate-500' },
  medium: { label: 'Medium', className: 'text-slate-400' },
  high: { label: 'High', className: 'text-amber-400' },
  critical: { label: 'Critical', className: 'text-red-400' },
}

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const status = STATUS_CONFIG[task.status] ?? { label: task.status, className: 'bg-slate-700 text-slate-300' }
  const priority = PRIORITY_CONFIG[task.priority] ?? { label: task.priority, className: 'text-slate-400' }

  return (
    <Link
      to={`/tasks/${task.id}`}
      className="block bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-slate-400 mt-0.5 line-clamp-1">{task.description}</p>
          )}
        </div>
        <span className={clsx('shrink-0 text-xs font-medium px-2 py-1 rounded-full', status.className)}>
          {status.label}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
        <span className={priority.className}>{priority.label} priority</span>
        {task.github_repo && (
          <span className="truncate">{task.github_repo}</span>
        )}
        {task.latest_run?.github_pr_url && (
          <span className="text-indigo-400 truncate">PR opened</span>
        )}
        <span className="ml-auto">{new Date(task.created_at).toLocaleDateString()}</span>
      </div>
    </Link>
  )
}
