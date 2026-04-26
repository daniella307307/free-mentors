import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { store } from './store'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4f46e5' },
    secondary: { main: '#06b6d4' },
    background: { default: '#f6f8ff', paper: '#ffffff' },
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: ['Inter', 'Segoe UI', 'Roboto', 'sans-serif'].join(','),
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
)
