import { alpha, createTheme } from '@mui/material/styles'

const palette = {
  mode: 'light',
  primary: { main: '#8a5a3b', light: '#b07a57', dark: '#6f442a', contrastText: '#fff9f2' },
  secondary: { main: '#a1724f', light: '#bc8f6f', dark: '#7f5639', contrastText: '#fff9f2' },
  background: { default: '#f4efe7', paper: '#ffffff' },
  text: { primary: '#1c1917', secondary: '#6b6560' },
}

export const appTheme = createTheme({
  palette,
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: ['"DM Sans"', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 800, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700 },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6 },
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
    },
  },
  shadows: [
    'none',
    '0 1px 2px rgba(62, 39, 21, 0.04)',
    '0 2px 8px rgba(62, 39, 21, 0.06)',
    '0 4px 14px rgba(62, 39, 21, 0.07)',
    '0 8px 24px rgba(62, 39, 21, 0.08)',
    '0 12px 30px rgba(62, 39, 21, 0.09)',
    '0 16px 40px rgba(62, 39, 21, 0.1)',
    '0 20px 50px rgba(62, 39, 21, 0.11)',
    '0 24px 56px rgba(62, 39, 21, 0.12)',
    '0 28px 64px rgba(62, 39, 21, 0.12)',
    '0 32px 72px rgba(62, 39, 21, 0.12)',
    '0 36px 80px rgba(62, 39, 21, 0.12)',
    '0 40px 88px rgba(62, 39, 21, 0.12)',
    '0 44px 96px rgba(62, 39, 21, 0.12)',
    '0 48px 104px rgba(62, 39, 21, 0.12)',
    '0 52px 112px rgba(62, 39, 21, 0.12)',
    '0 56px 120px rgba(62, 39, 21, 0.12)',
    '0 60px 128px rgba(62, 39, 21, 0.12)',
    '0 64px 136px rgba(62, 39, 21, 0.12)',
    '0 68px 144px rgba(62, 39, 21, 0.12)',
    '0 72px 152px rgba(62, 39, 21, 0.12)',
    '0 76px 160px rgba(62, 39, 21, 0.12)',
    '0 80px 168px rgba(62, 39, 21, 0.12)',
    '0 84px 176px rgba(62, 39, 21, 0.12)',
    '0 88px 184px rgba(62, 39, 21, 0.12)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: palette.background.default,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          transition: 'box-shadow 0.25s ease, border-color 0.2s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 700,
          transition: 'background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease, transform 0.15s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&.Mui-selected': {
            backgroundColor: alpha(palette.primary.main, 0.12),
            '&:hover': {
              backgroundColor: alpha(palette.primary.main, 0.16),
            },
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#f3f1f4',
          transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            backgroundColor: '#eeebef',
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff',
            boxShadow: `0 0 0 3px ${alpha(palette.primary.main, 0.15)}`,
          },
          '& fieldset': {
            borderColor: 'transparent',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(138, 90, 59, 0.25)',
          },
          '&.Mui-focused fieldset': {
            borderWidth: '1px',
            borderColor: palette.primary.main,
          },
        },
        input: {
          py: 1.35,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid',
          borderColor: 'rgba(62, 39, 21, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          transition: 'color 0.2s ease',
        },
      },
    },
  },
})
