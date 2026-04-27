import { useState } from 'react'
import { Avatar, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material'

export default function UserProfilePage({ user, onSaveProfile, loading = false }) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'User'
  const [draft, setDraft] = useState({})
  const valueOf = (field) => (draft[field] ?? user?.[field] ?? '')
  const setValue = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }))

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ mb: 2, alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
            {fullName?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Stack>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>{fullName}</Typography>
            <Typography color="text.secondary">Role: {user?.role || 'guest'}</Typography>
          </Stack>
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">Username</Typography>
            <Typography sx={{ mb: 1.5 }}>{user?.username || 'N/A'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography sx={{ mb: 1.5 }}>{user?.email || 'N/A'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">Occupation</Typography>
            <TextField
              fullWidth
              size="small"
              value={valueOf('occupation')}
              onChange={(e) => setValue('occupation', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">Expertise</Typography>
            <TextField
              fullWidth
              size="small"
              value={valueOf('expertise')}
              onChange={(e) => setValue('expertise', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">First Name</Typography>
            <TextField
              fullWidth
              size="small"
              value={valueOf('firstName')}
              onChange={(e) => setValue('firstName', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">Last Name</Typography>
            <TextField
              fullWidth
              size="small"
              value={valueOf('lastName')}
              onChange={(e) => setValue('lastName', e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary">Address</Typography>
            <TextField
              fullWidth
              size="small"
              value={valueOf('address')}
              onChange={(e) => setValue('address', e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary">Profile Picture URL</Typography>
            <TextField
              fullWidth
              size="small"
              value={valueOf('profilePicture')}
              onChange={(e) => setValue('profilePicture', e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary">Bio</Typography>
            <TextField
              fullWidth
              multiline
              minRows={3}
              value={valueOf('bio')}
              onChange={(e) => setValue('bio', e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <Button
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ maxWidth: { sm: 260 }, py: 1.2 }}
              onClick={() =>
                onSaveProfile({
                  firstName: valueOf('firstName'),
                  lastName: valueOf('lastName'),
                  address: valueOf('address'),
                  occupation: valueOf('occupation'),
                  expertise: valueOf('expertise'),
                  profilePicture: valueOf('profilePicture'),
                  bio: valueOf('bio'),
                })
              }
            >
              {loading ? 'Saving profile...' : 'Save Profile'}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
