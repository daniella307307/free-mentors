import { Box, Container, Grid, Paper, Stack, Typography } from '@mui/material'
import { alpha, keyframes } from '@mui/material/styles'
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'

const fade = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`

const STEPS = [
  {
    step: 1,
    title: 'Sign up',
    description: 'Create a free account and tell us what you are working toward.',
    Icon: PersonAddAltRoundedIcon,
  },
  {
    step: 2,
    title: 'Find a mentor',
    description: 'Explore profiles and expertise to find the right match for your goals.',
    Icon: SearchRoundedIcon,
  },
  {
    step: 3,
    title: 'Book a session',
    description: 'Pick a time, share your questions, and meet for a focused mentorship session.',
    Icon: EventAvailableRoundedIcon,
  },
]

export default function HowItWorks() {
  return (
    <Box component="section" sx={{ py: { xs: 5, md: 7 } }}>
      <Container maxWidth="lg">
        <Stack spacing={1} sx={{ mb: 4, textAlign: { xs: 'left', md: 'center' }, maxWidth: 640, mx: { md: 'auto' } }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>
            How it works
          </Typography>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 900 }}>
            Three steps to your next conversation
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {STEPS.map((item, index) => {
            const Icon = item.Icon
            return (
              <Grid key={item.step} size={{ xs: 12, md: 4 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    position: 'relative',
                    animation: `${fade} 0.55s ease-out both`,
                    animationDelay: `${index * 0.1}s`,
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3,
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                    },
                  }}
                >
                  <Stack spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} textAlign={{ xs: 'left', md: 'center' }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '1rem',
                      }}
                    >
                      {item.step}
                    </Box>
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.12),
                        color: 'secondary.dark',
                        mx: { md: 'auto' },
                      }}
                    >
                      <Icon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                      {item.description}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            )
          })}
        </Grid>
      </Container>
    </Box>
  )
}
