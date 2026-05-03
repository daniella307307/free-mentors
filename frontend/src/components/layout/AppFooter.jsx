import { Box, Container, Divider, Link as MuiLink, Stack, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router-dom'

function FooterLink({ to, children }) {
  return (
    <MuiLink
      component={RouterLink}
      to={to}
      underline="hover"
      color="text.secondary"
      sx={{ fontWeight: 600, fontSize: '0.875rem', transition: 'color 0.2s ease', '&:hover': { color: 'primary.main' } }}
    >
      {children}
    </MuiLink>
  )
}

export default function AppFooter({ roleLabel = 'guest' }) {
  const isGuest = roleLabel === 'guest'
  const isUser = roleLabel === 'user'
  const isMentor = roleLabel === 'mentor'
  const isAdmin = roleLabel === 'admin'
  const canBrowseMentors = isGuest || isUser || isMentor

  return (
    <Box
      component="footer"
      aria-label="Site footer"
      sx={{
        flexShrink: 0,
        mt: 'auto',
        borderTop: '1px solid',
        borderColor: 'divider',
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
        py: { xs: 3, sm: 4 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-start' } }}
        >
          <Box sx={{ maxWidth: 360 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
              Free Mentors
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
              Connect with experienced mentors, book sessions, and grow your career through real conversations.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'row', sm: 'row' }} spacing={3} flexWrap="wrap" useFlexGap sx={{ gap: 3 }}>
            <Stack spacing={1} sx={{ minWidth: 140 }}>
              <Typography variant="caption" color="primary" sx={{ fontWeight: 800, letterSpacing: 0.6 }}>
                Explore
              </Typography>
              <FooterLink to="/">Home</FooterLink>
              {canBrowseMentors ? <FooterLink to="/mentors">Mentors</FooterLink> : null}
              {isUser ? <FooterLink to="/request-mentorship">Request mentorship</FooterLink> : null}
            </Stack>

            <Stack spacing={1} sx={{ minWidth: 140 }}>
              <Typography variant="caption" color="primary" sx={{ fontWeight: 800, letterSpacing: 0.6 }}>
                Account
              </Typography>
              {isGuest ? (
                <>
                  <FooterLink to="/auth/login">Log in</FooterLink>
                  <FooterLink to="/auth/signup">Sign up</FooterLink>
                </>
              ) : (
                <>
                  <FooterLink to="/profile">Profile</FooterLink>
                  {isUser || isMentor ? <FooterLink to="/sessions">My sessions</FooterLink> : null}
                  {isMentor ? (
                    <>
                      <FooterLink to="/mentor/dashboard">Mentor dashboard</FooterLink>
                      <FooterLink to="/mentor/requests">Mentor requests</FooterLink>
                    </>
                  ) : null}
                  {isAdmin ? <FooterLink to="/admin">Admin</FooterLink> : null}
                </>
              )}
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} Free Mentors. Built for learning and community.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Mentorship requests require a free mentee account.
          </Typography>
        </Stack>
      </Container>
    </Box>
  )
}
