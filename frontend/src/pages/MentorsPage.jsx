import { useEffect } from 'react'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/ui/PageHeader'

function truncateText(text, maxLen) {
  const s = (text || '').trim()
  if (s.length <= maxLen) return s
  return `${s.slice(0, maxLen - 1)}…`
}

export default function MentorsPage({ mentors, loadMentors, openMentor, loading }) {
  useEffect(() => {
    loadMentors?.()
    // Load full directory on enter; parent may change identity — intentional once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Mentors"
        subtitle="Every mentor in the directory. Open a profile to learn more or start a mentorship request."
        action={
          <Button
            size="medium"
            variant="outlined"
            color="inherit"
            onClick={() => loadMentors?.({ notify: true })}
            disabled={loading}
            aria-busy={loading}
            sx={{ borderColor: 'divider', fontWeight: 700 }}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </Button>
        }
      />

      {loading && !mentors.length ? <LoadingState label="Loading mentors…" /> : null}

      {!loading && !mentors.length ? (
        <Typography color="text.secondary">No mentors found. Try refreshing.</Typography>
      ) : null}

      <Grid container spacing={2}>
        {mentors.map((m) => (
          <Grid key={m.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                transition: 'box-shadow 0.22s ease, border-color 0.2s ease, transform 0.18s ease',
                '&:hover': {
                  boxShadow: 3,
                  borderColor: (theme) => `${theme.palette.primary.main}40`,
                  transform: 'translateY(-3px)',
                },
              }}
            >
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Stack direction="row" spacing={1.5} sx={{ mb: 1.5, alignItems: 'center' }}>
                  <Avatar
                    src={m.profilePicture || undefined}
                    alt={m.username || ''}
                    imgProps={{ loading: 'lazy' }}
                    sx={{ width: 56, height: 56, bgcolor: 'primary.light', color: 'primary.contrastText' }}
                  >
                    {m.username?.[0]?.toUpperCase() || 'M'}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.25 }} noWrap>
                      {m.username}
                    </Typography>
                    {m.occupation ? (
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {m.occupation}
                      </Typography>
                    ) : null}
                  </Box>
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.4 }}>
                  Expertise
                </Typography>
                <Typography variant="body2" sx={{ mb: 1.25, minHeight: 40 }}>
                  {truncateText(m.expertise || 'Not specified yet.', 140)}
                </Typography>

                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.4 }}>
                  Bio
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1, minHeight: 72 }}>
                  {truncateText(m.bio || 'This mentor has not added a bio yet.', 180)}
                </Typography>

                <Button variant="contained" fullWidth onClick={() => openMentor(m.id)} sx={{ mt: 'auto' }}>
                  View profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}
