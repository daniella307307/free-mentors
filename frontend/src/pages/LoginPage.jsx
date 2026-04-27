import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import GoogleIcon from '@mui/icons-material/Google'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'

export default function LoginPage({ loginData, setLoginData, login, onGoToSignup }) {
  const [remember, setRemember] = useState(true)

  return (
    <Card
      sx={{
        width: '100%',
        height: '100%',
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
        <Stack spacing={1.25} sx={{ mb: 3, alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
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
            Welcome back! Sign in to continue
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
            Login
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={onGoToSignup}
            sx={{
              py: 1,
              borderRadius: 2.5,
              color: 'text.secondary',
              fontWeight: 600,
            }}
          >
            Sign Up
          </Button>
        </Stack>

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

          <Button variant="contained" onClick={login} size="large" fullWidth sx={{ py: 1.35 }}>
            Sign In
          </Button>

          

          <Typography variant="body2" color="text.secondary" sx={{ pt: 1, textAlign: 'center' }}>
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
      </CardContent>
    </Card>
  )
}
