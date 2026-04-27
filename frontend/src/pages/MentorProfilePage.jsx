import { useEffect, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingState from '../components/LoadingState'

export default function MentorProfilePage({
  loadMentor,
  questionDraft,
  setQuestionDraft,
  requestSession,
  canRequest,
  loadingMentor = false,
  submittingRequest = false,
}) {
  const navigate = useNavigate()
  const { mentorId } = useParams()
  const [mentor, setMentor] = useState(null)

  useEffect(() => {
    let alive = true
    const run = async () => {
      if (!mentorId) return
      const data = await loadMentor(mentorId)
      if (alive) setMentor(data || null)
    }
    run()
    return () => {
      alive = false
    }
  }, [mentorId, loadMentor])

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ mb: 2, gap: 1.5, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Mentor profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review their background and send a structured mentorship request.
            </Typography>
          </Stack>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate('/mentors')}
            sx={{ borderColor: 'divider', fontWeight: 600 }}
          >
            Back to directory
          </Button>
        </Stack>
        <Divider sx={{ mb: 3 }} />

        {mentor ? (
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
              <Avatar
                src={mentor.profilePicture || undefined}
                alt={mentor.username || ''}
                imgProps={{ loading: 'lazy' }}
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: 'secondary.light',
                  color: 'secondary.contrastText',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                }}
              >
                {mentor.username?.[0]?.toUpperCase() || 'M'}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {mentor.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {mentor.email}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                  <Chip size="small" label={mentor.role || 'mentor'} color="primary" variant="outlined" />
                  {mentor.occupation ? (
                    <Chip size="small" variant="outlined" label={mentor.occupation} />
                  ) : null}
                </Stack>
              </Box>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Expertise
              </Typography>
              <Typography>{mentor.expertise || 'Not specified yet.'}</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Bio
              </Typography>
              <Typography sx={{ lineHeight: 1.65 }}>{mentor.bio || 'This mentor has not added a bio yet.'}</Typography>
            </Stack>

            <Divider />

            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Your questions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add one question per line. Mentors see these when reviewing your request.
              </Typography>
              <TextField
                multiline
                minRows={4}
                placeholder="e.g. I want feedback on my portfolio&#10;How do I prepare for technical interviews?"
                value={questionDraft}
                onChange={(e) => setQuestionDraft(e.target.value)}
              />
              <Button
                variant="contained"
                onClick={() => requestSession(mentor.id)}
                disabled={!canRequest || submittingRequest}
                size="large"
                fullWidth
                sx={{ py: 1.25 }}
              >
                {submittingRequest ? 'Submitting request...' : 'Request mentorship session'}
              </Button>
              {!canRequest ? (
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                  Sign in as a mentee to send a request.
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        ) : (
          <LoadingState label={loadingMentor ? 'Loading mentor profile...' : 'Mentor profile unavailable.'} />
        )}
      </CardContent>
    </Card>
  )
}
