import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'

/**
 * Shared chrome for login / signup: brand mark, title, optional tab switcher, form body.
 */
export default function AuthCardShell({ mode, onSwitchToLogin, onSwitchToSignup, children }) {
  const isLogin = mode === 'login'

  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 440,
        mx: 'auto',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: (theme) => theme.shadows[4],
        overflow: 'hidden',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        '&:hover': {
          boxShadow: (theme) => theme.shadows[6],
        },
      }}
    >
      <Box
        sx={{
          height: 4,
          width: '100%',
          background: (theme) =>
            `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        }}
      />
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={1.25} sx={{ mb: 3, alignItems: 'center', textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 2,
            }}
          >
            <MenuBookRoundedIcon sx={{ fontSize: 34 }} aria-hidden />
          </Box>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Free Mentors
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            p: 0.5,
            borderRadius: 2.5,
            bgcolor: (theme) => theme.palette.action.hover,
            mb: 2.5,
          }}
          role="tablist"
          aria-label="Authentication mode"
        >
          <Box
            component="button"
            type="button"
            role="tab"
            aria-selected={isLogin}
            onClick={onSwitchToLogin}
            sx={{
              flex: 1,
              py: 1,
              borderRadius: 2,
              border: 'none',
              cursor: 'pointer',
              font: 'inherit',
              fontWeight: isLogin ? 700 : 600,
              color: isLogin ? 'text.primary' : 'text.secondary',
              bgcolor: isLogin ? 'background.paper' : 'transparent',
              boxShadow: isLogin ? 1 : 'none',
              transition: 'background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            }}
          >
            Login
          </Box>
          <Box
            component="button"
            type="button"
            role="tab"
            aria-selected={!isLogin}
            onClick={onSwitchToSignup}
            sx={{
              flex: 1,
              py: 1,
              borderRadius: 2,
              border: 'none',
              cursor: 'pointer',
              font: 'inherit',
              fontWeight: !isLogin ? 700 : 600,
              color: !isLogin ? 'text.primary' : 'text.secondary',
              bgcolor: !isLogin ? 'background.paper' : 'transparent',
              boxShadow: !isLogin ? 1 : 'none',
              transition: 'background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
                outlineOffset: 2,
              },
            }}
          >
            Sign Up
          </Box>
        </Stack>

        {children}
      </CardContent>
    </Card>
  )
}
