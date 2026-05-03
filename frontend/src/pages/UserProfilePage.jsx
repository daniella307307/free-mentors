import { useState } from 'react'
import { Avatar, Button, Card, CardContent, Divider, Grid, Stack, TextField, Typography } from '@mui/material'
import PageHeader from '../components/ui/PageHeader'

export default function UserProfilePage({ user, onSaveProfile, loading = false }) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'User'
  const [draft, setDraft] = useState({})
  const valueOf = (field) => (draft[field] ?? user?.[field] ?? '')
  const setValue = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }))

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <PageHeader
          title="Your profile"
          subtitle="Update how you show up to mentors and mentees. Username and email are read-only from this screen."
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ mb: 3, alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Avatar
            src={user?.profilePicture || undefined}
            sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem', fontWeight: 800 }}
          >
            {fullName?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Stack>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {fullName}
            </Typography>
            <Typography color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              Role: {user?.role || 'guest'}
            </Typography>
          </Stack>
        </Stack>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 700 }}>
          Account
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Username
            </Typography>
            <Typography sx={{ mt: 0.5 }}>{user?.username || 'N/A'}</Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Email
            </Typography>
            <Typography sx={{ mt: 0.5 }}>{user?.email || 'N/A'}</Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2, fontWeight: 700 }}>
          Public profile
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              Occupation
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={valueOf('occupation')}
              onChange={(e) => setValue('occupation', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              Expertise
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={valueOf('expertise')}
              onChange={(e) => setValue('expertise', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              First name
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={valueOf('firstName')}
              onChange={(e) => setValue('firstName', e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              Last name
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={valueOf('lastName')}
              onChange={(e) => setValue('lastName', e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              Address
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={valueOf('address')}
              onChange={(e) => setValue('address', e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              Profile picture URL
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={valueOf('profilePicture')}
              onChange={(e) => setValue('profilePicture', e.target.value)}
            />
          </Grid>
          <Grid size={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              Bio
            </Typography>
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
              sx={{ maxWidth: { sm: 280 }, py: 1.2 }}
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
              {loading ? 'Saving profile…' : 'Save profile'}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
