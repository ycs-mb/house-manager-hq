import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TaskCard } from './TaskCard'
import type { Task } from '@/api/tasks'

const mockTask: Task = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Task',
  description: 'A test description',
  status: 'pending',
  created_at: '2026-03-18T00:00:00Z',
  updated_at: '2026-03-18T00:00:00Z',
}

describe('TaskCard', () => {
  it('renders title and description', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
    expect(screen.getByText('A test description')).toBeInTheDocument()
  })

  it('renders status badge', () => {
    render(<TaskCard task={mockTask} />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('shows advance button when onStatusChange provided', () => {
    render(<TaskCard task={mockTask} onStatusChange={() => {}} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('does not show advance button when status is done', () => {
    render(<TaskCard task={{ ...mockTask, status: 'done' }} onStatusChange={() => {}} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
