import { Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'

export default function MentorDashboardPage({ mySessions, onLoadSessions, loadingSessions = false }) {
  const stats = useMemo(() => {
    const pending = mySessions.filter((s) => s.status === 'pending').length
    const accepted = mySessions.filter((s) => s.status === 'accepted').length
    const declined = mySessions.filter((s) => s.status === 'declined').length
    return { pending, accepted, declined }
  }, [mySessions])

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
          Mentor dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Track incoming mentorship requests and your session statuses.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap' }}>
          <Chip label={`Pending: ${stats.pending}`} color="warning" variant="outlined" />
          <Chip label={`Accepted: ${stats.accepted}`} color="success" variant="outlined" />
          <Chip label={`Declined: ${stats.declined}`} color="error" variant="outlined" />
        </Stack>
        <Button variant="contained" onClick={onLoadSessions} sx={{ py: 1.1, px: 2.5 }} disabled={loadingSessions}>
          {loadingSessions ? 'Loading sessions...' : 'Refresh sessions'}
        </Button>
      </CardContent>
    </Card>
  )
}
