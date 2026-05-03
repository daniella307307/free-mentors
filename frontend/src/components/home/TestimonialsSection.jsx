import { Box, Card, CardContent, Container, Grid, Stack, Typography } from '@mui/material'
import { alpha, keyframes } from '@mui/material/styles'
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded'
import StarRatingDisplay from '../StarRatingDisplay'

const floatIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`

const STATIC_TESTIMONIALS = [
  {
    id: 'static-1',
    quote: 'I booked one session and left with a clear plan for my portfolio. The mentor was generous with their time.',
    name: 'Amina K.',
    role: 'Product designer',
    rating: 5,
  },
  {
    id: 'static-2',
    quote: 'Finding someone in my field was easy. The session felt practical — not generic career advice.',
    name: 'Jordan M.',
    role: 'Software engineer',
    rating: 5,
  },
  {
    id: 'static-3',
    quote: 'As a mentor, I love that the platform keeps scheduling and questions organized.',
    name: 'Priya S.',
    role: 'Marketing lead & mentor',
    rating: 5,
  },
]

export default function TestimonialsSection({ reviews = [], loading = false }) {
  const dynamicCards = (reviews || []).slice(0, 6).map((r) => ({
    id: r.id,
    quote: r.comment || 'Great session — highly recommend this mentor.',
    name: r.reviewer?.username || 'Mentee',
    role: `with ${r.mentor?.username || 'a mentor'}`,
    rating: r.rating,
  }))

  const items = dynamicCards.length ? dynamicCards : STATIC_TESTIMONIALS

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 7 },
        bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.04),
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={1} sx={{ mb: 4, textAlign: { xs: 'left', md: 'center' }, maxWidth: 640, mx: { md: 'auto' } }}>
          <Typography variant="overline" color="primary" sx={{ fontWeight: 800, letterSpacing: 1.2 }}>
            Social proof
          </Typography>
          <Typography variant="h4" component="h2" sx={{ fontWeight: 900 }}>
            What people are saying
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {dynamicCards.length
              ? 'Recent feedback from mentees who completed sessions.'
              : 'A few voices from our community — real reviews appear here as sessions complete.'}
          </Typography>
        </Stack>

        {loading ? (
          <Typography color="text.secondary" variant="body2">
            Loading reviews…
          </Typography>
        ) : (
          <Grid container spacing={2.5}>
            {items.map((item, index) => (
              <Grid key={item.id} size={{ xs: 12, md: 4 }}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    animation: `${floatIn} 0.5s ease-out both`,
                    animationDelay: `${index * 0.08}s`,
                    transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <FormatQuoteRoundedIcon sx={{ fontSize: 36, color: 'primary.main', opacity: 0.5, mb: 0.5 }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.65, mb: 2, fontWeight: 500 }}>
                      {item.quote}
                    </Typography>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Box>
                        <Typography sx={{ fontWeight: 800 }}>{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.role}
                        </Typography>
                      </Box>
                      <StarRatingDisplay value={item.rating} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  )
}
