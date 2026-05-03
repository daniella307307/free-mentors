import { Box, Container, Drawer, Grid, Paper, Toolbar, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import AppFooter from './AppFooter'
import AppHeader from './AppHeader'

export default function AppShell({
  isAuthRoute,
  showNavigationSidebar,
  hideAppBar = false,
  isMobileNav,
  mobileNavOpen,
  onMobileNavOpen,
  onMobileNavClose,
  navList,
  roleLabel,
  showSignOut,
  onSignOut,
  children,
}) {
  const headerVariant = hideAppBar || isAuthRoute ? 'none' : 'full'

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'auto',
        paddingTop: 0,
        marginBottom: isAuthRoute ? 0 : roleLabel === 'guest' ? { xs: 8, sm: 8 } : 0,
        backgroundColor: 'background.default',
        backgroundImage: (theme) =>
          `radial-gradient(1200px 500px at 10% -10%, ${alpha(theme.palette.primary.main, 0.09)} 0%, transparent 55%),
           radial-gradient(900px 420px at 100% 0%, ${alpha(theme.palette.secondary.main, 0.07)} 0%, transparent 50%)`,
      }}
    >
      <AppHeader
        variant={headerVariant}
        isMobileNav={isMobileNav}
        showNavigationSidebar={showNavigationSidebar}
        onMobileNavOpen={onMobileNavOpen}
        roleLabel={roleLabel}
        showSignOut={showSignOut}
        onSignOut={onSignOut}
      />
      {headerVariant !== 'none' ? <Toolbar /> : null}

      {showNavigationSidebar ? (
        <Drawer
          anchor="left"
          open={mobileNavOpen}
          onClose={onMobileNavClose}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: 'min(88%, 320px)', boxSizing: 'border-box' } }}
        >
          <Box component="nav" aria-label="Mobile" sx={{ pt: 2, pb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, py: 1, fontWeight: 700 }}>
              Menu
            </Typography>
            {navList}
          </Box>
        </Drawer>
      ) : null}

      <Container
        maxWidth={isAuthRoute ? 'sm' : false}
        disableGutters={!isAuthRoute}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          justifyContent: isAuthRoute ? 'center' : 'flex-start',
          alignItems: isAuthRoute ? 'center' : 'stretch',
          py: isAuthRoute ? 3 : { xs: 2, md: 3 },
          px: isAuthRoute ? 2 : { xs: 2, md: 3 },
        }}
      >
        <Grid
          container
          spacing={{ xs: 0, md: showNavigationSidebar ? 3 : 0 }}
          sx={{ flex: 1, alignItems: 'stretch', minHeight: 0, mx: isAuthRoute ? 'auto' : 0, width: '100%' }}
        >
          {showNavigationSidebar ? (
            <Grid sx={{ display: { xs: 'none', md: 'block' } }} size={{ md: 3 }}>
              <Paper
                component="nav"
                aria-label="Main"
                sx={{
                  p: 1.25,
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: 2,
                  position: 'sticky',
                  top: (theme) => {
                    const h = theme.mixins?.toolbar?.minHeight ?? 56
                    const gap = parseFloat(theme.spacing(2)) || 16
                    return typeof h === 'number' ? h + gap : 72
                  },
                  maxHeight: (theme) => {
                    const h = theme.mixins?.toolbar?.minHeight ?? 56
                    const hh = typeof h === 'number' ? h : 56
                    const pad = parseFloat(theme.spacing(3)) || 24
                    return `calc(100dvh - ${hh + pad}px)`
                  },
                  overflow: 'auto',
                  bgcolor: alpha('#ffffff', 0.72),
                  backdropFilter: 'blur(8px)',
                }}
                elevation={0}
              >
                <Typography variant="subtitle2" color="text.secondary" sx={{ px: 1.25, py: 1, fontWeight: 700 }}>
                  Menu
                </Typography>
                {navList}
              </Paper>
            </Grid>
          ) : null}

          <Grid
            size={{ xs: 12, md: showNavigationSidebar ? 9 : 12 }}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              minHeight: 0,
              justifyContent: isAuthRoute ? 'center' : 'flex-start',
              maxWidth: isAuthRoute ? '100%' : { md: showNavigationSidebar ? 'none' : 'lg' },
              mx: isAuthRoute ? 0 : { md: showNavigationSidebar ? 0 : 'auto' },
              width: '100%',
            }}
          >
            <Box component="main" id="main-content" sx={{ flex: 1, minHeight: 0 }} tabIndex={-1}>
              {children}
            </Box>
          </Grid>
        </Grid>
      </Container>

      {!isAuthRoute && roleLabel === 'guest' ? <AppFooter roleLabel={roleLabel} /> : null}
    </Box>
  )
}
