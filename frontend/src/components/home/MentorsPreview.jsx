import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { alpha, keyframes } from '@mui/material/styles'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'

const rise = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`

function MentorCardSkeleton() {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
          <Skeleton variant="circular" width={56} height={56} />
          <Box flex={1}>
            <Skeleton width="60%" />
            <Skeleton width="40%" />
          </Box>
        </Stack>
        <Skeleton height={40} />
        <Skeleton width="50%" sx={{ mt: 2 }} />
      </CardContent>
    </Card>
  )
}

export default function MentorsPreview({
  mentors = [],
  loading = false,
  maxDisplay = 6,
  onViewAll,
  onViewProfile,
}) {
  const list = mentors.slice(0, maxDisplay)

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 7 },
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 4 }}
        >
          <Box>
            <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>
              Mentors
            </Typography>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 900, mt: 0.5 }}>
              Meet people who want to help
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 520 }}>
              A snapshot of mentors on the platform. Open a profile to learn more and book a session.
            </Typography>
          </Box>
          <Button
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={onViewAll}
            sx={{ fontWeight: 800, flexShrink: 0, transition: 'transform 0.2s ease', '&:hover': { transform: 'translateX(4px)' } }}
          >
            View all mentors
          </Button>
        </Stack>

        <Grid container spacing={2.5}>
          {loading
            ? Array.from({ length: Math.min(maxDisplay, 6) }).map((_, i) => (
                <Grid key={`sk-${i}`} size={{ xs: 12, sm: 6, md: 4 }}>
                  <MentorCardSkeleton />
                </Grid>
              ))
            : list.map((m, index) => (
                <Grid key={m.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    elevation={0}
                    sx={{
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      animation: `${rise} 0.45s ease-out both`,
                      animationDelay: `${index * 0.06}s`,
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: 5,
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                      },
                    }}
                  >
                    <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 1.5 }}>
                        <Avatar
                          src={m.profilePicture || undefined}
                          alt={m.username || ''}
                          imgProps={{ loading: 'lazy' }}
                          sx={{
                            width: 56,
                            height: 56,
                            fontWeight: 800,
                            bgcolor: 'primary.main',
                          }}
                        >
                          {m.username?.[0]?.toUpperCase() || 'M'}
                        </Avatar>
                        <Box minWidth={0}>
                          <Typography sx={{ fontWeight: 800 }} noWrap>
                            {m.username}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {m.occupation || 'Mentor'}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          flex: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.6,
                          minHeight: 72,
                        }}
                      >
                        {m.expertise || m.bio || 'Experienced mentor ready to help you grow.'}
                      </Typography>
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 2, fontWeight: 700, borderColor: 'divider' }}
                        onClick={() => onViewProfile?.(m.id)}
                      >
                        View profile
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
        </Grid>

        {!loading && !list.length ? (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No mentors loaded yet. Try again in a moment or open the full directory.
          </Typography>
        ) : null}
      </Container>
    </Box>
  )
}
