import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import { Link as RouterLink } from 'react-router-dom'

/**
 * @param {'full' | 'minimal' | 'none'} variant
 *   full — logged-in style with optional mobile menu + sign out
 *   minimal — auth pages: brand only, links home
 *   none — do not render (caller may skip mounting)
 */
export default function AppHeader({
  variant = 'full',
  isMobileNav = false,
  showNavigationSidebar = false,
  onMobileNavOpen,
  roleLabel = 'guest',
  showSignOut = false,
  onSignOut,
}) {
  if (variant === 'none') return null

  if (variant === 'minimal') {
    return (
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          flexShrink: 0,
          mb: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha('#ffffff', 0.92),
          backdropFilter: 'blur(12px)',
          zIndex: (theme) => theme.zIndex.appBar,
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            justifyContent: 'space-between',
            gap: 2,
            mb: 0,
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.25 },
            maxWidth: 'lg',
            width: '100%',
            mx: 'auto',
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            component={RouterLink}
            to="/"
            sx={{
              alignItems: 'center',
              minWidth: 0,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
                flexShrink: 0,
                boxShadow: 2,
              }}
            >
              <MenuBookRoundedIcon sx={{ fontSize: 22 }} aria-hidden />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.15 }} noWrap>
                Free Mentors
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Community mentorship platform
              </Typography>
            </Box>
          </Stack>
          <Button component={RouterLink} to="/" color="inherit" size="small" sx={{ fontWeight: 700 }}>
            Back to home
          </Button>
        </Toolbar>
      </AppBar>
    )
  }

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        top: 0,
        left: 0,
        right: 0,
        flexShrink: 0,
        mb: 0,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: alpha('#ffffff', 0.92),
        backdropFilter: 'blur(12px)',
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
          mb: 0,
          px: { xs: 2, sm: 3 },
          py: { xs: 1, sm: 1.25 },
          maxWidth: 'lg',
          width: '100%',
          mx: 'auto',
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}>
          {isMobileNav && showNavigationSidebar ? (
            <IconButton
              edge="start"
              color="inherit"
              onClick={onMobileNavOpen}
              aria-label="Open navigation menu"
            >
              <MenuRoundedIcon />
            </IconButton>
          ) : null}
          <Stack
            direction="row"
            spacing={1.5}
            component={RouterLink}
            to="/"
            sx={{
              alignItems: 'center',
              minWidth: 0,
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 40,
                height: 40,
                flexShrink: 0,
                boxShadow: 2,
              }}
            >
              <MenuBookRoundedIcon sx={{ fontSize: 22 }} aria-hidden />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.15 }} noWrap>
                Free Mentors
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Community mentorship platform
              </Typography>
            </Box>
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
          <Chip
            label={`Role: ${roleLabel}`}
            color="primary"
            size="small"
            sx={{ fontWeight: 700, '& .MuiChip-label': { textTransform: 'capitalize' } }}
            variant="outlined"
          />
          {showSignOut ? (
            <>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<LogoutRoundedIcon />}
                onClick={onSignOut}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  borderColor: 'divider',
                  fontWeight: 700,
                }}
              >
                Sign out
              </Button>
              <IconButton
                onClick={onSignOut}
                color="primary"
                aria-label="Sign out"
                sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
              >
                <LogoutRoundedIcon />
              </IconButton>
            </>
          ) : null}
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
