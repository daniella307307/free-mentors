import { Button, Card, CardContent, Paper, Stack, Typography } from '@mui/material'
import LoadingState from '../components/LoadingState'
import SessionStatusChip from '../components/SessionStatusChip'
import PageHeader from '../components/ui/PageHeader'

export default function SessionsPage({
  mySessions,
  role,
  loadMySessions,
  updateSession,
  loadingSessions,
  updatingSession,
}) {
  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <PageHeader
          title="My mentorship sessions"
          subtitle="Track every request and its status. Mentors can respond to pending sessions here or on the mentor requests page."
          action={
            <Button
              variant="contained"
              onClick={loadMySessions}
              disabled={loadingSessions}
              aria-busy={loadingSessions}
            >
              {loadingSessions ? 'Loading…' : 'Refresh'}
            </Button>
          }
        />
        <Stack spacing={1.5}>
          {loadingSessions ? <LoadingState label="Loading sessions…" compact /> : null}
          {mySessions.map((session) => (
            <Paper
              key={session.id}
              elevation={0}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'box-shadow 0.2s ease',
                '&:hover': { boxShadow: 1 },
              }}
            >
              <Stack spacing={1}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  gap={1}
                  sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
                >
                  <Typography>
                    <strong>Mentor:</strong> {session.mentor?.username} | <strong>Mentee:</strong>{' '}
                    {session.mentee?.username}
                  </Typography>
                  <SessionStatusChip status={session.status} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  <strong>Questions:</strong> {(session.questions || []).join(' | ') || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Date:</strong> {session.sessionDate || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Time:</strong> {session.sessionTime || 'N/A'}
                </Typography>
                {role === 'mentor' && session.status === 'pending' ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={() => updateSession(session.id, 'accept')}
                      disabled={updatingSession}
                    >
                      {updatingSession ? 'Updating…' : 'Accept'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => updateSession(session.id, 'decline')}
                      disabled={updatingSession}
                    >
                      {updatingSession ? 'Updating…' : 'Decline'}
                    </Button>
                  </Stack>
                ) : null}
              </Stack>
            </Paper>
          ))}
          {!loadingSessions && !mySessions.length ? (
            <Typography color="text.secondary">
              No sessions yet. Request a mentor from the directory to get started.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}
