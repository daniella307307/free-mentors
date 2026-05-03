import { useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import LoadingState from '../components/LoadingState'
import SessionStatusChip from '../components/SessionStatusChip'
import PageHeader from '../components/ui/PageHeader'

export default function MenteeDashboardPage({
  mySessions,
  loadMySessions,
  loadingSessions,
}) {
  const [filter, setFilter] = useState('all')

  const pending = mySessions.filter((s) => s.status === 'pending')
  const accepted = mySessions.filter((s) => s.status === 'accepted')
  const completed = mySessions.filter((s) => s.status === 'completed')

  const upcoming = accepted.filter((s) => {
    const date = new Date(`${s.sessionDate} ${s.sessionTime}`)
    return date > new Date()
  })

  const filteredSessions =
    filter === 'all' ? mySessions : mySessions.filter((s) => s.status === filter)

  return (
    <Stack spacing={3} component="article">
      <PageHeader
        title="Your dashboard"
        subtitle="Track mentorship requests, upcoming sessions, and history in one place."
      />
      <Grid container spacing={2}>
        {[
          { label: 'Total', value: mySessions.length },
          { label: 'Pending', value: pending.length },
          { label: 'Upcoming', value: upcoming.length },
          { label: 'Completed', value: completed.length },
        ].map((stat) => (
          <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }} elevation={0}>
              <Typography variant="h6">{stat.value}</Typography>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <CardContent>
          <Typography variant="h6" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Upcoming sessions
          </Typography>

          {upcoming.length === 0 ? (
            <Typography color="text.secondary">
              No upcoming sessions. When a mentor accepts a request, it will show up here.
            </Typography>
          ) : (
            upcoming.map((session) => (
              <Paper key={session.id} sx={{ p: 2, mt: 1, border: '1px solid', borderColor: 'divider' }} elevation={0}>
                <Typography>
                  <strong>Mentor:</strong> {session.mentor?.username}
                </Typography>
                <Typography>
                  {session.sessionDate} at {session.sessionTime}
                </Typography>
              </Paper>
            ))
          )}
        </CardContent>
      </Card>

      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {['all', 'pending', 'accepted', 'completed', 'declined'].map((f) => (
          <Chip
            key={f}
            label={f}
            clickable
            color={filter === f ? 'primary' : 'default'}
            onClick={() => setFilter(f)}
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Stack>

      <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 800 }}>
              Sessions
            </Typography>

            <Button onClick={loadMySessions} disabled={loadingSessions} aria-busy={loadingSessions}>
              Refresh
            </Button>
          </Stack>

          {loadingSessions ? <LoadingState label="Loading…" compact /> : null}

          {filteredSessions.map((session) => (
            <Paper key={session.id} sx={{ p: 2, mt: 1, border: '1px solid', borderColor: 'divider' }} elevation={0}>
              <Stack spacing={1}>
                <Typography>
                  <strong>Mentor:</strong> {session.mentor?.username}
                </Typography>

                <Typography variant="body2">
                  {session.sessionDate} • {session.sessionTime}
                </Typography>

                <SessionStatusChip status={session.status} sx={{ width: 'fit-content' }} />
              </Stack>
            </Paper>
          ))}

          {!loadingSessions && !filteredSessions.length ? (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              No sessions match this filter.
            </Typography>
          ) : null}
        </CardContent>
      </Card>
    </Stack>
  )
}
