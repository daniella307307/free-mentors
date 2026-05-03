import { Button, Card, CardContent, MenuItem, Stack, TextField } from '@mui/material'
import { useEffect, useState } from 'react'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/ui/PageHeader'

export default function RequestMentorshipPage({
  mentors,
  questionDraft,
  setQuestionDraft,
  loadMentors,
  requestSession,
  loadingMentors = false,
  submittingRequest = false,
  preselectedMentorId = null,
}) {
  const [selectedMentorId, setSelectedMentorId] = useState(() =>
    preselectedMentorId != null && preselectedMentorId !== '' ? String(preselectedMentorId) : '',
  )
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const slotOptions = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00']

  useEffect(() => {
    loadMentors?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <PageHeader
          title="Request mentorship"
          subtitle="Choose a mentor, share your questions, and pick a date and time window. You can refine details with your mentor after they respond."
          action={
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => loadMentors?.({ notify: true })}
              sx={{ borderColor: 'divider', fontWeight: 700 }}
              disabled={loadingMentors}
            >
              {loadingMentors ? 'Loading mentors…' : 'Refresh mentor list'}
            </Button>
          }
        />

        <Stack spacing={2}>
          {loadingMentors ? <LoadingState label="Loading mentors…" compact /> : null}
          <TextField
            select
            label="Mentor"
            value={selectedMentorId}
            onChange={(e) => setSelectedMentorId(e.target.value)}
            fullWidth
            helperText={
              mentors.length
                ? `${mentors.length} mentors available`
                : 'Load mentors to see options'
            }
          >
            {mentors.map((mentor) => (
              <MenuItem key={mentor.id} value={String(mentor.id)}>
                {mentor.username} — {mentor.email}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            multiline
            minRows={5}
            label="Questions (one per line)"
            placeholder="What do you want help with?"
            value={questionDraft}
            onChange={(e) => setQuestionDraft(e.target.value)}
            fullWidth
          />
          <TextField
            type="date"
            label="Session date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Pick the day for your mentorship session"
          />
          <TextField
            select
            label="Session time period"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            fullWidth
            helperText="Pick a time window that works for you"
          >
            {slotOptions.map((slot) => (
              <MenuItem key={slot} value={slot}>
                {slot}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!selectedMentorId || !selectedDate || !selectedSlot || submittingRequest}
            onClick={() => requestSession(selectedMentorId, selectedDate, selectedSlot)}
            sx={{ py: 1.25 }}
          >
            {submittingRequest ? 'Sending request…' : 'Send mentorship request'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
