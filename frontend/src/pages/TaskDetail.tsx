import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTask } from '@/api/tasks'
import { getRun } from '@/api/runs'
import { fetchApprovals, decideApproval } from '@/api/approvals'
import { Layout } from '@/components/Layout'
import { useState } from 'react'
import clsx from 'clsx'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-slate-700 text-slate-300' },
  in_progress: { label: 'In Progress', className: 'bg-blue-500/20 text-blue-400' },
  in_review: { label: 'In Review', className: 'bg-amber-500/20 text-amber-400' },
  done: { label: 'Done', className: 'bg-emerald-500/20 text-emerald-400' },
  failed: { label: 'Failed', className: 'bg-red-500/20 text-red-400' },
}

export function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [comment, setComment] = useState('')

  const { data: task, isLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => getTask(id!),
    refetchInterval: 5_000,
    enabled: !!id,
  })

  const runId = task?.latest_run?.id
  const { data: run } = useQuery({
    queryKey: ['runs', runId],
    queryFn: () => getRun(runId!),
    enabled: !!runId && ['running', 'queued'].includes(task?.latest_run?.status ?? ''),
    refetchInterval: 3_000,
  })

  const { data: approvals = [] } = useQuery({
    queryKey: ['approvals', 'task', id],
    queryFn: () => fetchApprovals('pending'),
    enabled: task?.status === 'in_review',
    refetchInterval: 5_000,
  })

  const taskApproval = approvals.find((a) => a.task_id === id)

  const decideMutation = useMutation({
    mutationFn: ({ approvalId, decision }: { approvalId: string; decision: 'approved' | 'rejected' }) =>
      decideApproval(approvalId, { decision, comment: comment || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      setComment('')
    },
  })

  if (isLoading || !task) {
    return (
      <Layout>
        <div className="text-slate-400 text-center py-16">Loading...</div>
      </Layout>
    )
  }

  const status = STATUS_CONFIG[task.status] ?? { label: task.status, className: 'bg-slate-700 text-slate-300' }
  const currentRun = run ?? task.latest_run

  return (
    <Layout>
      <div className="mb-6">
        <Link to="/" className="text-slate-400 hover:text-white text-sm transition-colors">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="space-y-6">
        {/* Task header */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">{task.title}</h1>
              {task.description && (
                <p className="text-slate-400 mt-2">{task.description}</p>
              )}
            </div>
            <span className={clsx('shrink-0 text-sm font-medium px-3 py-1 rounded-full', status.className)}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-slate-500">
            {task.github_repo && <span>Repo: {task.github_repo}</span>}
            <span>Created: {new Date(task.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Agent run */}
        {currentRun && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white">Agent Run</h2>
              <div className="flex items-center gap-3">
                {currentRun.github_pr_url && (
                  <a
                    href={currentRun.github_pr_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    View PR →
                  </a>
                )}
                <span className={clsx(
                  'text-xs font-medium px-2 py-1 rounded-full',
                  currentRun.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                  currentRun.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                  currentRun.status === 'running' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-slate-700 text-slate-300'
                )}>
                  {currentRun.status}
                </span>
              </div>
            </div>

            {currentRun.tokens_used && (
              <p className="text-xs text-slate-500 mb-3">
                Tokens used: {currentRun.tokens_used.toLocaleString()}
              </p>
            )}

            {currentRun.output_log && (
              <div className="bg-slate-950 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                  {currentRun.output_log}
                </pre>
              </div>
            )}

            {(currentRun.status === 'running' || currentRun.status === 'queued') && (
              <div className="flex items-center gap-2 mt-3 text-sm text-slate-400">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                Agent is working...
              </div>
            )}
          </div>
        )}

        {/* Approval panel */}
        {task.status === 'in_review' && taskApproval && (
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-6">
            <h2 className="font-semibold text-white mb-4">Review Required</h2>
            <p className="text-slate-300 text-sm mb-4">
              The agent has completed the task and opened a PR. Please review the changes and approve or reject.
            </p>

            {currentRun?.github_pr_url && (
              <a
                href={currentRun.github_pr_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg px-4 py-2 mb-4 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Review PR on GitHub
              </a>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                placeholder="Add a review comment..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => decideMutation.mutate({ approvalId: taskApproval.id, decision: 'approved' })}
                disabled={decideMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-lg px-5 py-2 text-sm transition-colors"
              >
                Approve & merge
              </button>
              <button
                onClick={() => decideMutation.mutate({ approvalId: taskApproval.id, decision: 'rejected' })}
                disabled={decideMutation.isPending}
                className="bg-red-600/30 hover:bg-red-600/50 disabled:opacity-50 text-red-400 font-medium rounded-lg px-5 py-2 text-sm transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {task.status === 'done' && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-emerald-400">
            Task completed and approved.
          </div>
        )}

        {task.status === 'failed' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-red-400">
            Task failed or was rejected.
          </div>
        )}
      </div>
    </Layout>
  )
}
