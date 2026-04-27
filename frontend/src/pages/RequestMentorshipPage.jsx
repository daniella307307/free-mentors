import { Button, Card, CardContent, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'

export default function RequestMentorshipPage({
  mentors,
  questionDraft,
  setQuestionDraft,
  loadMentors,
  requestSession,
}) {
  const [selectedMentorId, setSelectedMentorId] = useState('')

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={0.5} sx={{ mb: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Request mentorship
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a mentor, outline your goals, and send a structured request in one step.
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'flex-end' }}>
            <Button variant="outlined" color="inherit" onClick={loadMentors} sx={{ borderColor: 'divider', fontWeight: 600 }}>
              Refresh mentor list
            </Button>
          </Stack>
          <TextField
            select
            label="Mentor"
            value={selectedMentorId}
            onChange={(e) => setSelectedMentorId(e.target.value)}
            fullWidth
            helperText={mentors.length ? `${mentors.length} mentors available` : 'Load mentors to see options'}
          >
            {mentors.map((mentor) => (
              <MenuItem key={mentor.id} value={mentor.id}>
                {mentor.username} &mdash; {mentor.email}
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
          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={!selectedMentorId}
            onClick={() => requestSession(selectedMentorId)}
            sx={{ py: 1.25 }}
          >
            Send mentorship request
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
