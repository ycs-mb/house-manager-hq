import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { TaskCard } from './TaskCard'
import type { Task } from '@/api/tasks'

const mockTask: Task = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Task',
  description: 'A test description',
  status: 'pending',
  priority: 'medium',
  github_repo: null,
  latest_run: null,
  created_at: '2026-03-18T00:00:00Z',
  updated_at: '2026-03-18T00:00:00Z',
}

const renderCard = (task: Task = mockTask) =>
  render(<MemoryRouter><TaskCard task={task} /></MemoryRouter>)

describe('TaskCard', () => {
  it('renders title and description', () => {
    renderCard()
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('A test description')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    renderCard()
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders in_review status', () => {
    renderCard({ ...mockTask, status: 'in_review' })
    expect(screen.getByText('In Review')).toBeInTheDocument()
  })
})
