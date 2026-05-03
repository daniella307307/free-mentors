import {
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AuthCardShell from '../components/ui/AuthCardShell'

export default function SignupPage({ registerData, setRegisterData, register, loading = false, onGoToLogin }) {
  return (
    <AuthCardShell mode="signup" onSwitchToLogin={onGoToLogin} onSwitchToSignup={() => {}}>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
        Create your account and start learning with mentors.
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Username"
          placeholder="Choose a username"
          value={registerData.username}
          onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
          fullWidth
          autoComplete="username"
        />
        <TextField
          label="Email"
          placeholder="Enter your email"
          value={registerData.email}
          onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
          fullWidth
          autoComplete="email"
        />
        <TextField
          type="password"
          label="Password"
          placeholder="Create a strong password"
          value={registerData.password}
          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
          fullWidth
          autoComplete="new-password"
        />

        <Button
          variant="contained"
          onClick={register}
          size="large"
          fullWidth
          sx={{ py: 1.35 }}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Creating account…' : 'Create account'}
        </Button>

        <Typography variant="body2" color="text.secondary" sx={{ pt: 0.5, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link
            component="button"
            type="button"
            variant="body2"
            onClick={(e) => {
              e.preventDefault()
              onGoToLogin()
            }}
            sx={{ fontWeight: 700, cursor: 'pointer' }}
          >
            Sign in
          </Link>
        </Typography>
      </Stack>
    </AuthCardShell>
  )
}
