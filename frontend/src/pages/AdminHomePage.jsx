import { useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import StarRatingDisplay from '../components/StarRatingDisplay'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/ui/PageHeader'

const ROLE_OPTIONS = ['user', 'mentor', 'admin']

export default function AdminHomePage({
  mentorsCount,
  sessionsCount,
  adminUsers,
  currentUserId,
  onLoadUsers,
  onSetUserRole,
  loadingUsers = false,
  updatingRole = false,
  flaggedMentorReviews = [],
  onLoadFlaggedReviews,
  onSetReviewHidden,
  loadingFlaggedReviews = false,
  updatingReviewModeration = false,
}) {
  useEffect(() => {
    onLoadUsers()
    onLoadFlaggedReviews?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Stack spacing={2.5} width="100%" height="100%">
      <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <PageHeader
            title="Admin overview"
            subtitle="Manage user roles and monitor high-level activity. Mentorship requests and mentor browsing are disabled for admin accounts."
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap' }}>
            <Chip label={`${mentorsCount} mentors in directory`} variant="outlined" />
            <Chip label={`${sessionsCount} sessions tied to your account`} variant="outlined" />
            <Chip label={`${adminUsers.length} registered users`} variant="outlined" color="primary" />
          </Stack>

          <Button
            variant="outlined"
            onClick={onLoadUsers}
            fullWidth
            sx={{ py: 1.1, borderColor: 'divider', maxWidth: { sm: 360 } }}
            disabled={loadingUsers}
          >
            {loadingUsers ? 'Loading users…' : 'Refresh user list'}
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
            All users
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Change someone&apos;s role with the dropdown. Your own row is read-only so you cannot remove your admin access
            by accident.
          </Typography>

          <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
            {loadingUsers ? <LoadingState label="Loading users…" compact /> : null}
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adminUsers.map((u) => {
                  const isSelf = u.id === currentUserId
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.username}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell sx={{ minWidth: 160 }}>
                        {isSelf ? (
                          <Chip size="small" label={`${u.role} (you)`} color="primary" variant="outlined" />
                        ) : (
                          <FormControl size="small" fullWidth>
                            <Select
                              value={u.role}
                              onChange={(e) => onSetUserRole(u.id, e.target.value)}
                              sx={{ fontWeight: 600, textTransform: 'capitalize' }}
                              disabled={updatingRole}
                            >
                              {ROLE_OPTIONS.map((r) => (
                                <MenuItem key={r} value={r}>
                                  {r}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box
                          component="code"
                          sx={{
                            fontSize: '0.75rem',
                            wordBreak: 'break-all',
                            display: 'block',
                            maxWidth: 280,
                          }}
                        >
                          {u.createdAt}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {!adminUsers.length ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography color="text.secondary" variant="body2">
                        No users loaded yet. Click &quot;Refresh user list&quot; above (or fix any error banner).
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <PageHeader
            title="Flagged reviews"
            subtitle="Mentors flag reviews for your review. Hiding a review removes it from public mentor profiles and homepage feeds."
          />
          <Button
            variant="outlined"
            onClick={onLoadFlaggedReviews}
            disabled={loadingFlaggedReviews}
            sx={{ mb: 2, borderColor: 'divider' }}
          >
            {loadingFlaggedReviews ? 'Loading…' : 'Refresh flagged reviews'}
          </Button>

          <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Mentor</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Reviewer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Comment</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flaggedMentorReviews.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.mentor?.username || '—'}</TableCell>
                    <TableCell>{r.reviewer?.username || '—'}</TableCell>
                    <TableCell>
                      <StarRatingDisplay value={r.rating} size="small" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        {r.comment || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {r.hidden ? (
                        <Chip size="small" label="Hidden" variant="outlined" />
                      ) : (
                        <Chip size="small" label="Visible" color="warning" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      {!r.hidden ? (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          disabled={updatingReviewModeration}
                          onClick={() => onSetReviewHidden?.(r.id, true, null)}
                        >
                          Hide
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={updatingReviewModeration}
                          onClick={() => onSetReviewHidden?.(r.id, false, null)}
                        >
                          Unhide
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!flaggedMentorReviews.length ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="text.secondary" variant="body2">
                        No flagged reviews right now.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Stack>
  )
}
