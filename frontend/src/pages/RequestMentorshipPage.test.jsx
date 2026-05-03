import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import RequestMentorshipPage from './RequestMentorshipPage'

const mentors = [
  { id: 'm-1', username: 'mentor-one', email: 'mentor1@example.com' },
]

function renderPage(overrides = {}) {
  const props = {
    mentors,
    questionDraft: '',
    setQuestionDraft: vi.fn(),
    loadMentors: vi.fn(),
    requestSession: vi.fn(),
    loadingMentors: false,
    submittingRequest: false,
    ...overrides,
  }
  render(<RequestMentorshipPage {...props} />)
  return props
}

describe('RequestMentorshipPage', () => {
  it('renders with submit disabled by default', () => {
    renderPage()
    const submitButton = screen.getByRole('button', { name: /send mentorship request/i })
    expect(submitButton).toBeDisabled()
    expect(screen.getByLabelText('Session date')).toBeInTheDocument()
    expect(screen.getByLabelText('Session time period')).toBeInTheDocument()
  })

  it('sends mentor/date/time in requestSession payload', async () => {
    const user = userEvent.setup()
    const requestSession = vi.fn()
    renderPage({ requestSession })

    await user.click(screen.getByLabelText('Mentor'))
    await user.click(screen.getByRole('option', { name: /mentor-one/i }))
    fireEvent.change(screen.getByLabelText('Session date'), { target: { value: '2030-08-01' } })
    await user.click(screen.getByLabelText('Session time period'))
    await user.click(screen.getByRole('option', { name: '10:00-11:00' }))

    await user.click(screen.getByRole('button', { name: /send mentorship request/i }))
    expect(requestSession).toHaveBeenCalledWith('m-1', '2030-08-01', '10:00-11:00')
  })
})
