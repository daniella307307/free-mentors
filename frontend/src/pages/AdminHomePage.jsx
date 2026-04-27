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
import LoadingState from '../components/LoadingState'

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
  onGoToMentors,
  onGoToSessions,
}) {
  useEffect(() => {
    onLoadUsers()
    // Intentionally once on mount; use "Refresh user list" to reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  

  return (
    <Stack spacing={2.5} width="100%" height="100%">
      <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
            Admin overview
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Browse all accounts, change roles from the table, and jump to mentors or sessions.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2.5, flexWrap: 'wrap' }}>
            <Chip label={`${mentorsCount} mentors (directory)`} variant="outlined" />
            <Chip label={`${sessionsCount} sessions (yours)`} variant="outlined" />
            <Chip label={`${adminUsers.length} users (full list)`} variant="outlined" color="primary" />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button variant="outlined" onClick={onLoadUsers} fullWidth sx={{ py: 1.1, borderColor: 'divider' }} disabled={loadingUsers}>
              {loadingUsers ? 'Loading users...' : 'Refresh user list'}
            </Button>
            <Button variant="outlined" onClick={onGoToMentors} fullWidth sx={{ py: 1.1, borderColor: 'divider' }}>
              Open mentors
            </Button>
            <Button variant="outlined" onClick={onGoToSessions} fullWidth sx={{ py: 1.1, borderColor: 'divider' }}>
              Open sessions
            </Button>
          </Stack>
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
            {loadingUsers ? <LoadingState label="Loading users..." compact /> : null}
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
    </Stack>
  )
}
