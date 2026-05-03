import { Box, Card, CardContent, Container, Grid, Stack, Typography } from '@mui/material'
import { alpha, keyframes } from '@mui/material/styles'
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'

const rise = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`

const FEATURES = [
  {
    icon: GroupsRoundedIcon,
    title: 'Find mentors easily',
    description: 'Browse profiles, expertise, and backgrounds to find someone who fits your goals.',
  },
  {
    icon: EventAvailableRoundedIcon,
    title: 'Book mentorship sessions',
    description: 'Request a time slot, share your questions, and get one-on-one time with a mentor.',
  },
  {
    icon: SchoolRoundedIcon,
    title: 'Learn from professionals',
    description: 'Tap into real-world experience from people who have been where you want to go.',
  },
  {
    icon: TrendingUpRoundedIcon,
    title: 'Grow your career',
    description: 'Turn conversations into clarity — stronger direction, skills, and confidence.',
  },
]

export default function FeaturesSection() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 7 },
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1} sx={{ mb: 4, textAlign: { xs: 'left', md: 'center' }, maxWidth: 640, mx: { md: 'auto' } }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>
            Why Free Mentors
          </Typography>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 900 }}>
            Everything you need to connect and learn
          </Typography>
          <Typography variant="body1" color="text.secondary">
            A simple flow from discovery to session — built for mentees and mentors who want meaningful conversations.
          </Typography>
        </Stack>

        <Grid container spacing={2.5}>
          {FEATURES.map((item, index) => {
            const Icon = item.icon
            return (
              <Grid key={item.title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    animation: `${rise} 0.5s ease-out both`,
                    animationDelay: `${index * 0.08}s`,
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: 4,
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.35),
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                        color: 'primary.main',
                        mb: 1.5,
                      }}
                    >
                      <Icon sx={{ fontSize: 28 }} />
                    </Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.75 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Container>
    </Box>
  )
}
