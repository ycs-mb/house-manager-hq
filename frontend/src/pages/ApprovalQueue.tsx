import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchApprovals, decideApproval } from '@/api/approvals'
import { Layout } from '@/components/Layout'
import clsx from 'clsx'

export function ApprovalQueue() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<string>('pending')
  const [comments, setComments] = useState<Record<string, string>>({})

  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['approvals', filter],
    queryFn: () => fetchApprovals(filter || undefined),
    refetchInterval: 10_000,
  })

  const decideMutation = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: 'approved' | 'rejected' }) =>
      decideApproval(id, { decision, comment: comments[id] || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const STATUS_BADGE = {
    pending: 'bg-amber-500/20 text-amber-400',
    approved: 'bg-emerald-500/20 text-emerald-400',
    rejected: 'bg-red-500/20 text-red-400',
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Approval Queue</h1>
        <p className="text-slate-400 mt-1">Review agent-generated changes before they ship.</p>
      </div>

      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={clsx(
              'text-sm font-medium px-3 py-1.5 rounded-lg transition-colors',
              filter === s ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            )}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-slate-400 text-center py-16">Loading...</div>
      ) : approvals.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl">
          <p className="text-slate-500">No approvals {filter ? `with status "${filter}"` : ''}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((approval) => (
            <div key={approval.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <Link
                    to={`/tasks/${approval.task_id}`}
                    className="font-medium text-white hover:text-indigo-400 transition-colors"
                  >
                    {approval.task_title || approval.task_id}
                  </Link>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(approval.created_at).toLocaleString()}
                  </p>
                </div>
                <span className={clsx(
                  'shrink-0 text-xs font-medium px-2 py-1 rounded-full',
                  STATUS_BADGE[approval.status] ?? 'bg-slate-700 text-slate-300'
                )}>
                  {approval.status}
                </span>
              </div>

              {approval.comment && (
                <p className="text-sm text-slate-400 mb-3">{approval.comment}</p>
              )}

              {approval.status === 'pending' && (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Optional comment..."
                    value={comments[approval.id] ?? ''}
                    onChange={(e) => setComments((prev) => ({ ...prev, [approval.id]: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => decideMutation.mutate({ id: approval.id, decision: 'approved' })}
                      disabled={decideMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-1.5 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => decideMutation.mutate({ id: approval.id, decision: 'rejected' })}
                      disabled={decideMutation.isPending}
                      className="bg-red-600/30 hover:bg-red-600/50 disabled:opacity-50 text-red-400 text-sm font-medium rounded-lg px-4 py-1.5 transition-colors"
                    >
                      Reject
                    </button>
                    <Link
                      to={`/tasks/${approval.task_id}`}
                      className="text-slate-400 hover:text-white text-sm px-4 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      View task
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}
