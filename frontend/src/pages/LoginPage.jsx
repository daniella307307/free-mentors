import { useState } from 'react'
import {
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AuthCardShell from '../components/ui/AuthCardShell'

export default function LoginPage({ loginData, setLoginData, login, loading = false, onGoToSignup }) {
  const [remember, setRemember] = useState(true)

  return (
    <AuthCardShell mode="login" onSwitchToLogin={() => {}} onSwitchToSignup={onGoToSignup}>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
        Welcome back — sign in to continue.
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Email"
          placeholder="Enter your email"
          value={loginData.email}
          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          fullWidth
          autoComplete="email"
        />
        <TextField
          type="password"
          label="Password"
          placeholder="Enter your password"
          value={loginData.password}
          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          fullWidth
          autoComplete="current-password"
        />

        <Stack
          direction="row"
          gap={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                size="small"
                sx={{ color: 'text.secondary' }}
              />
            }
            label={<Typography variant="body2">Remember me</Typography>}
          />
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault()
              window.alert('Password reset is not available yet.')
            }}
            sx={{ fontWeight: 600 }}
          >
            Forgot password?
          </Link>
        </Stack>

        <Button
          variant="contained"
          onClick={login}
          size="large"
          fullWidth
          sx={{ py: 1.35 }}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5, textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault()
              onGoToSignup()
            }}
            sx={{ fontWeight: 700, cursor: 'pointer' }}
          >
            Sign up
          </Link>
        </Typography>
      </Stack>
    </AuthCardShell>
  )
}
