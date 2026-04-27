import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { store } from './store'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#8a5a3b', light: '#b07a57', dark: '#6f442a', contrastText: '#fff9f2' },
    secondary: { main: '#a1724f', light: '#bc8f6f', dark: '#7f5639', contrastText: '#fff9f2' },
    background: { default: '#f4efe7', paper: '#ffffff' },
    text: { primary: '#1c1917', secondary: '#6b6560' },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: ['DM Sans', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 800, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f4efe7',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 14,
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
          transition: 'background-color 0.2s ease',
          '&:hover': {
            backgroundColor: '#eeebef',
          },
          '&.Mui-focused': {
            backgroundColor: '#ffffff',
          },
          '& fieldset': {
            borderColor: 'transparent',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(138, 90, 59, 0.25)',
          },
          '&.Mui-focused fieldset': {
            borderWidth: '1px',
            borderColor: 'primary.main',
          },
        },
        input: {
          py: 1.35,
        },
      },
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
