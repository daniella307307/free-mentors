import { Button, Card, CardContent, Chip, Paper, Stack, Typography } from '@mui/material'

const statusColor = {
  pending: 'warning',
  accepted: 'success',
  declined: 'error',
}

export default function MentorRequestsPage({ mySessions, updateSession, onRefresh }) {
  const requests = mySessions.filter((s) => s.status === 'pending' || s.status === 'accepted' || s.status === 'declined')

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider'}} elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ mb: 2, gap: 1, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Mentor requests</Typography>
            <Typography variant="body2" color="text.secondary">
              Accept or decline pending mentorship sessions.
            </Typography>
          </Stack>
          <Button variant="contained" onClick={onRefresh}>Refresh</Button>
        </Stack>
        <Stack spacing={1.5}>
          {requests.map((session) => (
            <Paper key={session.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 3 }} elevation={0}>
              <Stack spacing={1}>
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} sx={{ justifyContent: 'space-between' }}>
                  <Typography>
                    <strong>Mentee:</strong> {session.mentee?.username} | <strong>Mentor:</strong> {session.mentor?.username}
                  </Typography>
                  <Chip label={session.status} color={statusColor[session.status] || 'default'} size="small" />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  <strong>Questions:</strong> {(session.questions || []).join(' | ') || 'N/A'}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button variant="contained" size="small" fullWidth onClick={() => updateSession(session.id, 'accept')}>
                    Accept
                  </Button>
                  <Button variant="outlined" size="small" fullWidth onClick={() => updateSession(session.id, 'decline')}>
                    Decline
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
          {!requests.length ? <Typography color="text.secondary">No requests yet.</Typography> : null}
        </Stack>
      </CardContent>
    </Card>
  )
}
