import { Button, Card, CardContent, Chip, Grid, Paper, Stack, Typography } from '@mui/material'
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded'
import { useMemo } from 'react'
import PageHeader from '../components/ui/PageHeader'

export default function MentorDashboardPage({
  mySessions,
  onLoadSessions,
  loadingSessions = false,
  mentorUserId = null,
  onViewPublicProfile,
}) {
  const stats = useMemo(() => {
    const pending = mySessions.filter((s) => s.status === 'pending').length
    const accepted = mySessions.filter((s) => s.status === 'accepted').length
    const completed = mySessions.filter((s) => s.status === 'completed').length
    const declined = mySessions.filter((s) => s.status === 'declined').length
    return { pending, accepted, completed, declined }
  }, [mySessions])

  const statItems = [
    { label: 'Pending', value: stats.pending, color: 'warning' },
    { label: 'Accepted', value: stats.accepted, color: 'success' },
    { label: 'Completed', value: stats.completed, color: 'primary' },
    { label: 'Declined', value: stats.declined, color: 'error' },
  ]

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <PageHeader
          title="Mentor dashboard"
          subtitle="Track incoming mentorship requests and your session statuses."
          action={
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              {mentorUserId && onViewPublicProfile ? (
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<PersonSearchRoundedIcon />}
                  onClick={() => onViewPublicProfile(mentorUserId)}
                  sx={{ borderColor: 'divider', fontWeight: 700 }}
                >
                  My public profile
                </Button>
              ) : null}
              <Button
                variant="contained"
                onClick={onLoadSessions}
                disabled={loadingSessions}
                aria-busy={loadingSessions}
              >
                {loadingSessions ? 'Loading…' : 'Refresh sessions'}
              </Button>
            </Stack>
          }
        />

        <Grid container spacing={1.5} sx={{ mb: 2 }}>
          {statItems.map((s) => (
            <Grid key={s.label} size={{ xs: 6, sm: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.75,
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {s.value}
                </Typography>
                <Chip size="small" label={s.label} color={s.color} variant="outlined" sx={{ mt: 1 }} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}
