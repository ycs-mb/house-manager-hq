import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTasks, createTask } from '@/api/tasks'
import { TaskCard } from '@/components/TaskCard'
import { Layout } from '@/components/Layout'

export function Dashboard() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [githubRepo, setGithubRepo] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchTasks(),
    refetchInterval: 10_000,
  })

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setTitle('')
      setDescription('')
      setGithubRepo('')
      setShowForm(false)
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      github_repo: githubRepo.trim() || undefined,
    })
  }

  const pending = tasks.filter((t) => t.status === 'pending')
  const active = tasks.filter((t) => ['in_progress', 'in_review'].includes(t.status))
  const completed = tasks.filter((t) => ['done', 'failed'].includes(t.status))

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">AI agents handle the execution — you stay in control.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
        >
          + New Task
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 space-y-4"
        >
          <h2 className="font-semibold text-white">Create Task</h2>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Task description <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g. Add email validation to the signup form"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Additional context
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Any extra details, acceptance criteria, or constraints..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              GitHub repo <span className="text-slate-500">(owner/repo)</span>
            </label>
            <input
              type="text"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder="e.g. acme/webapp"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
            >
              {createMutation.isPending ? 'Creating...' : 'Create & dispatch agent'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-white text-sm px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </div>
          {createMutation.isError && (
            <p className="text-red-400 text-sm">{createMutation.error?.message}</p>
          )}
        </form>
      )}

      {isLoading ? (
        <div className="text-slate-400 text-center py-16">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl">
          <p className="text-slate-500">No tasks yet.</p>
          <p className="text-slate-600 text-sm mt-1">Create one above to dispatch your first agent.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
                Active ({active.length})
              </h2>
              <div className="space-y-2">
                {active.map((t) => <TaskCard key={t.id} task={t} />)}
              </div>
            </section>
          )}
          {pending.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
                Pending ({pending.length})
              </h2>
              <div className="space-y-2">
                {pending.map((t) => <TaskCard key={t.id} task={t} />)}
              </div>
            </section>
          )}
          {completed.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">
                Completed ({completed.length})
              </h2>
              <div className="space-y-2">
                {completed.map((t) => <TaskCard key={t.id} task={t} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </Layout>
  )
}
