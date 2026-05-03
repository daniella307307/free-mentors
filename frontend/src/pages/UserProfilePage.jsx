import { useState } from 'react'
import { Avatar, Button, Card, CardContent, Divider, Grid, Stack, TextField, Typography } from '@mui/material'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import PageHeader from '../components/ui/PageHeader'

function displayField(value) {
  const s = value != null ? String(value).trim() : ''
  return s || '—'
}

export default function UserProfilePage({
  user,
  onSaveProfile,
  loading = false,
  /** When set (e.g. for mentors), shows a link to the public mentor listing profile. */
  onViewPublicMentorProfile,
}) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'User'
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState({})
  const valueOf = (field) => (draft[field] ?? user?.[field] ?? '')
  const setValue = (field, value) => setDraft((prev) => ({ ...prev, [field]: value }))
  const startEdit = () => {
    setDraft({})
    setIsEditing(true)
  }

  const cancelEdit = () => {
    setDraft({})
    setIsEditing(false)
  }

  const buildPayload = () => ({
    firstName: valueOf('firstName'),
    lastName: valueOf('lastName'),
    address: valueOf('address'),
    occupation: valueOf('occupation'),
    expertise: valueOf('expertise'),
    profilePicture: valueOf('profilePicture'),
    bio: valueOf('bio'),
  })

  const handleSave = async () => {
    const ok = await onSaveProfile?.(buildPayload())
    if (ok) {
      setDraft({})
      setIsEditing(false)
    }
  }

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <PageHeader
          title="Your profile"
          subtitle={
            isEditing
              ? 'Update how you show up to mentors and mentees. Username and email cannot be changed here.'
              : 'Your account and public details. Use Edit to change your profile.'
          }
          action={
            !isEditing ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                {user?.role === 'mentor' && onViewPublicMentorProfile ? (
                  <Button variant="outlined" onClick={onViewPublicMentorProfile} sx={{ fontWeight: 700 }}>
                    View public mentor profile
                  </Button>
                ) : null}
                <Button
                  variant="contained"
                  startIcon={<EditRoundedIcon />}
                  onClick={startEdit}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  Edit profile
                </Button>
              </Stack>
            ) : null
          }
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

        {!isEditing ? (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                First name
              </Typography>
              <Typography sx={{ mt: 0.5 }}>{displayField(user?.firstName)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Last name
              </Typography>
              <Typography sx={{ mt: 0.5 }}>{displayField(user?.lastName)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Occupation
              </Typography>
              <Typography sx={{ mt: 0.5 }}>{displayField(user?.occupation)}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Expertise
              </Typography>
              <Typography sx={{ mt: 0.5 }}>{displayField(user?.expertise)}</Typography>
            </Grid>
            <Grid size={12}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Address
              </Typography>
              <Typography sx={{ mt: 0.5 }}>{displayField(user?.address)}</Typography>
            </Grid>
            {/* <Grid size={12}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Profile picture URL
              </Typography>
              <Typography sx={{ mt: 0.5, wordBreak: 'break-all' }}>{displayField(user?.profilePicture)}</Typography>
            </Grid> */}
            <Grid size={12}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Bio
              </Typography>
              <Typography sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{displayField(user?.bio)}</Typography>
            </Grid>
          </Grid>
        ) : (
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
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ maxWidth: { sm: 480 } }}>
                <Button variant="contained" disabled={loading} onClick={handleSave} sx={{ py: 1.2, flex: 1 }}>
                  {loading ? 'Saving…' : 'Save changes'}
                </Button>
                <Button variant="outlined" disabled={loading} onClick={cancelEdit} sx={{ py: 1.2, flex: 1 }}>
                  Cancel
                </Button>
              </Stack>
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  )
}
