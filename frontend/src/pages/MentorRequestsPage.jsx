import { Button, Card, CardContent, Paper, Stack, Typography } from '@mui/material'
import SessionStatusChip from '../components/SessionStatusChip'
import PageHeader from '../components/ui/PageHeader'

export default function MentorRequestsPage({
  mySessions,
  updateSession,
  onRefresh,
  loadingSessions = false,
  /** Per-session busy flag so one Accept/Decline does not disable every row */
  sessionActionBusy = () => false,
}) {
  const requests = mySessions.filter(
    (s) => s.status === 'pending' || s.status === 'accepted' || s.status === 'completed' || s.status === 'declined',
  )

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <PageHeader
          title="Mentor requests"
          subtitle="Accept or decline pending mentorship sessions. Actions are only available while a request is pending."
          action={
            <Button variant="contained" onClick={onRefresh} disabled={loadingSessions} aria-busy={loadingSessions}>
              {loadingSessions ? 'Loading…' : 'Refresh'}
            </Button>
          }
        />
        <Stack spacing={1.5}>
          {requests.map((session) => {
            const rowBusy = sessionActionBusy(session.id)
            return (
            <Paper
              key={session.id}
              elevation={0}
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
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
                    <strong>Mentee:</strong> {session.mentee?.username} | <strong>Mentor:</strong>{' '}
                    {session.mentor?.username}
                  </Typography>
                  <SessionStatusChip status={session.status} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  <strong>Questions:</strong> {(session.questions || []).join(' | ') || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Date:</strong> {session.sessionDate || 'N/A'} | <strong>Time:</strong>{' '}
                  {session.sessionTime || 'N/A'}
                </Typography>
                {session.status === 'pending' ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      onClick={() => updateSession(session.id, 'accept')}
                      disabled={rowBusy}
                    >
                      {rowBusy ? 'Updating…' : 'Accept'}
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() => updateSession(session.id, 'decline')}
                      disabled={rowBusy}
                    >
                      {rowBusy ? 'Updating…' : 'Decline'}
                    </Button>
                  </Stack>
                ) : null}
              </Stack>
            </Paper>
            )
          })}
          {!requests.length ? (
            <Typography color="text.secondary">
              No requests yet. When a mentee books you, pending sessions will appear here.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}
