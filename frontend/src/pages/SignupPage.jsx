import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import GoogleIcon from '@mui/icons-material/Google'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'

export default function SignupPage({ registerData, setRegisterData, register, onGoToLogin }) {
  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 440,
        mx: 'auto',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 20px 50px rgba(62, 39, 21, 0.12)',
      }}
      elevation={0}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={1.25} sx={{ mb: 3, alignItems: 'center' }}>
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
            }}
          >
            <MenuBookRoundedIcon sx={{ fontSize: 34 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
            Free Mentors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Create your account and start learning with mentors
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            p: 0.5,
            borderRadius: 3,
            bgcolor: (theme) => theme.palette.grey[200],
            mb: 2.5,
          }}
        >
          <Button
            fullWidth
            variant="text"
            onClick={onGoToLogin}
            sx={{
              py: 1,
              borderRadius: 2.5,
              color: 'text.secondary',
              fontWeight: 600,
            }}
          >
            Login
          </Button>
          <Button
            fullWidth
            sx={{
              py: 1,
              borderRadius: 2.5,
              bgcolor: 'background.paper',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              color: 'text.primary',
              fontWeight: 700,
              '&:hover': { bgcolor: 'background.paper' },
            }}
          >
            Sign Up
          </Button>
        </Stack>

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

          <Button variant="contained" onClick={register} size="large" fullWidth sx={{ py: 1.35 }}>
            Create Account
          </Button>

          <Typography variant="body2" color="text.secondary" sx={{ pt: 1, textAlign: 'center' }}>
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
      </CardContent>
    </Card>
  )
}
