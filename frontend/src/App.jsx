import { useMemo, useState } from 'react'
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Drawer,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import PersonIcon from '@mui/icons-material/Person'
import HomeIcon from '@mui/icons-material/Home'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import { gql } from 'graphql-request'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { clearAuth, setAuth } from './features/authSlice'
import { request } from './api/request'
import LoginPage from './pages/LoginPage'
import AdminHomePage from './pages/AdminHomePage'
import MentorDashboardPage from './pages/MentorDashboardPage'
import MentorRequestsPage from './pages/MentorRequestsPage'
import MentorProfilePage from './pages/MentorProfilePage'
import RequestMentorshipPage from './pages/RequestMentorshipPage'
import SignupPage from './pages/SignupPage'
import UserProfilePage from './pages/UserProfilePage'

const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    registerUser(username: $username, email: $email, password: $password) {
      success
      message
      user { id username email role }
    }
  }
`

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      success
      message
      token
      user { id username email role }
    }
  }
`
const UPDATE_PROFILE = gql`
  mutation UpdateProfile(
    $firstName: String
    $lastName: String
    $address: String
    $bio: String
    $occupation: String
    $expertise: String
    $profilePicture: String
  ) {
    updateMyProfile(
      firstName: $firstName
      lastName: $lastName
      address: $address
      bio: $bio
      occupation: $occupation
      expertise: $expertise
      profilePicture: $profilePicture
    ) {
      success
      message
      user {
        id
        username
        email
        role
        firstName
        lastName
        address
        bio
        occupation
        expertise
        profilePicture
      }
    }
  }
`

const MENTORS = gql`
  query {
    mentors {
      id
      username
      email
      role
      bio
      occupation
      expertise
      profilePicture
    }
  }
`
const MENTOR = gql`
  query Mentor($mentorId: String!) {
    mentor(mentorId: $mentorId) {
      id
      username
      email
      bio
      occupation
      expertise
      role
      profilePicture
    }
  }
`
const CREATE_SESSION = gql`
  mutation Create($mentorId: String!, $questions: [String]) {
    createMentorshipSessionRequest(mentorId: $mentorId, questions: $questions) {
      success
      message
      mentorshipSession { id status mentor { id username } mentee { id username } }
    }
  }
`
const MY_SESSIONS = gql`
  query {
    myMentorshipSessions {
      id
      status
      mentor { id username }
      mentee { id username }
      questions
      createdAt
    }
  }
`
const ALL_USERS = gql`
  query AllUsers {
    allUsers {
      id
      username
      email
      role
      createdAt
    }
  }
`
const ADMIN_SET_USER_ROLE = gql`
  mutation AdminSetUserRole($userId: String!, $role: String!) {
    adminSetUserRole(userId: $userId, role: $role) {
      success
      message
      user { id username email role }
    }
  }
`
const ACCEPT_SESSION = gql`
  mutation Accept($sessionId: String!) {
    acceptMentorshipSessionRequest(sessionId: $sessionId) {
      success
      message
      mentorshipSession { id status }
    }
  }
`
const DECLINE_SESSION = gql`
  mutation Decline($sessionId: String!) {
    declineMentorshipSessionRequest(sessionId: $sessionId) {
      success
      message
      mentorshipSession { id status }
    }
  }
`

const navItems = [
  { key: 'login', path: '/auth/login', label: 'Login', icon: <LockOpenRoundedIcon fontSize="small" />, roles: ['guest'] },
  { key: 'signup', path: '/auth/signup', label: 'Sign Up', icon: <PersonAddAlt1RoundedIcon fontSize="small" />, roles: ['guest'] },
  { key: 'mentors', path: '/mentors', label: 'Mentors', icon: <GroupsRoundedIcon fontSize="small" />, roles: ['guest', 'user', 'mentor', 'admin'] },
  { key: 'request-mentorship', path: '/mentorship/request', label: 'Request Mentorship', icon: <PersonAddAlt1RoundedIcon fontSize="small" />, roles: ['user', 'admin'] },
  { key: 'sessions', path: '/sessions', label: 'My Sessions', icon: <EventNoteRoundedIcon fontSize="small" />, roles: ['user', 'mentor', 'admin'] },
  { key: 'mentor-dashboard', path: '/mentor/dashboard', label: 'Mentor Dashboard', icon: <HomeIcon fontSize="small" />, roles: ['mentor'] },
  { key: 'mentor-requests', path: '/mentor/requests', label: 'Mentor Requests', icon: <EventNoteRoundedIcon fontSize="small" />, roles: ['mentor'] },
  { key: 'admin', path: '/admin', label: 'Admin Overview', icon: <AdminPanelSettingsRoundedIcon fontSize="small" />, roles: ['admin'] },
  { key: 'profile', path: '/profile', label: 'Profile', icon: <PersonIcon fontSize="small" />, roles: ['user', 'mentor', 'admin'] },
]

/** Where signed-in users land after login or when hitting a generic redirect (not the first sidebar link). */
const homePathByRole = {
  guest: '/auth/login',
  user: '/mentors',
  mentor: '/mentor/dashboard',
  admin: '/admin',
}

const statusColor = {
  pending: 'warning',
  accepted: 'success',
  declined: 'error',
}

function App() {
  const theme = useTheme()
  const isMobileNav = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const auth = useSelector((state) => state.auth)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' })
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [mentors, setMentors] = useState([])
  const [questionDraft, setQuestionDraft] = useState('')
  const [mySessions, setMySessions] = useState([])
  const [adminUsers, setAdminUsers] = useState([])

  const roleLabel = auth?.user?.role || 'guest'
  const availableNavItems = useMemo(
    () => navItems.filter((item) => item.roles.includes(roleLabel)),
    [roleLabel],
  )
  const defaultPath = homePathByRole[roleLabel] || '/auth/login'

  const safeRequest = async (run) => {
    setError('')
    setNotice('')
    try {
      return await run()
    } catch (err) {
      setError(err?.response?.errors?.[0]?.message || err.message || 'Request failed.')
      return undefined
    }
  }

  const register = () =>
    safeRequest(async () => {
      const { email, password } = registerData
      const result = await request(REGISTER, registerData)
      if (!result.registerUser.success) return setError(result.registerUser.message)
      setRegisterData({ username: '', email: '', password: '' })

      const loginResult = await request(LOGIN, { email, password })
      if (!loginResult?.loginUser?.success) {
        setNotice('Account created. Please sign in with your email and password.')
        setLoginData((prev) => ({ ...prev, email }))
        navigate('/auth/login')
        return
      }

      const user = loginResult.loginUser.user
      dispatch(setAuth({ token: loginResult.loginUser.token, user }))
      setNotice('Welcome! Your account is ready.')
      const role = user?.role || 'user'
      navigate(homePathByRole[role] || '/mentors')
    })

  const login = () =>
    safeRequest(async () => {
      const result = await request(LOGIN, loginData)
      if (!result.loginUser.success) return setError(result.loginUser.message)
      dispatch(setAuth({ token: result.loginUser.token, user: result.loginUser.user }))
      setNotice('Signed in successfully.')
    })

  const updateProfile = (payload) =>
    safeRequest(async () => {
      const result = await request(UPDATE_PROFILE, payload)
      if (!result.updateMyProfile.success) return setError(result.updateMyProfile.message)
      dispatch(setAuth({ token: auth.token, user: result.updateMyProfile.user }))
      setNotice(result.updateMyProfile.message || 'Profile updated.')
    })

  const loadMentors = () =>
    safeRequest(async () => {
      const result = await request(MENTORS)
      setMentors(result.mentors || [])
      setNotice(`Loaded ${result.mentors?.length || 0} mentors.`)
    })

  const loadMentor = async (mentorId) =>
    safeRequest(async () => {
      const result = await request(MENTOR, { mentorId })
      return result.mentor
    })

  const requestSession = (mentorId) =>
    safeRequest(async () => {
      const questions = questionDraft
        .split('\n')
        .map((q) => q.trim())
        .filter(Boolean)
      const result = await request(CREATE_SESSION, { mentorId, questions })
      if (!result.createMentorshipSessionRequest.success) {
        return setError(result.createMentorshipSessionRequest.message)
      }
      setNotice('Mentorship request submitted.')
      setQuestionDraft('')
      loadMySessions()
    })

  const loadMySessions = () =>
    safeRequest(async () => {
      const result = await request(MY_SESSIONS)
      setMySessions(result.myMentorshipSessions || [])
    })

  const loadAdminUsers = () =>
    safeRequest(async () => {
      const result = await request(ALL_USERS)
      setAdminUsers(result.allUsers ?? [])
    })

  const adminSetUserRole = (userId, role) =>
    safeRequest(async () => {
      const result = await request(ADMIN_SET_USER_ROLE, { userId, role })
      const payload = result.adminSetUserRole
      if (!payload.success) return setError(payload.message)
      const listResult = await request(ALL_USERS)
      setAdminUsers(listResult.allUsers ?? [])
      setNotice(payload.message || 'Role updated.')
    })

  const updateSession = (sessionId, action) =>
    safeRequest(async () => {
      const mutation = action === 'accept' ? ACCEPT_SESSION : DECLINE_SESSION
      const key = action === 'accept' ? 'acceptMentorshipSessionRequest' : 'declineMentorshipSessionRequest'
      const result = await request(mutation, { sessionId })
      if (!result[key].success) return setError(result[key].message)
      setNotice(`Session ${action}ed.`)
      loadMySessions()
    })

  const signOut = () => {
    dispatch(clearAuth())
    setMySessions([])
    setNotice('Signed out.')
    navigate('/auth/login')
  }

  const isAuthRoute = location.pathname.startsWith('/auth')

  const navList = (
    <List disablePadding>
      {availableNavItems.map((item) => (
        <ListItemButton
          key={item.key}
          selected={
            location.pathname === item.path ||
            (item.path === '/mentors' && location.pathname.startsWith('/mentors/'))
          }
          onClick={() => {
            navigate(item.path)
            setMobileNavOpen(false)
          }}
          sx={{ mb: 0.5 }}
        >
          <ListItemIcon sx={{ minWidth: 34, color: 'inherit' }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: 700 } } }} />
        </ListItemButton>
      ))}
    </List>
  )

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f4efe7',
        overflow: 'auto',
      }}
    >
      {!isAuthRoute ? (
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: alpha('#ffffff', 0.85),
          backdropFilter: 'blur(8px)',
        }}
      >
        <Toolbar
          disableGutters
          sx={{
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
            px: { xs: 2, sm: 3, md: 4 },
            maxWidth: '100%',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0, flex: 1 }}>
            {isMobileNav ? (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation menu"
              >
                <MenuRoundedIcon />
              </IconButton>
            ) : null}
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, flexShrink: 0 }}>
                <MenuBookRoundedIcon sx={{ fontSize: 22 }} />
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }} noWrap>
                  Free Mentors
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                  Community mentorship platform
                </Typography>
              </Box>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
            <Chip label={`Role: ${roleLabel}`} color="primary" variant="outlined" size="small" />
            {auth.token ? (
              <IconButton onClick={signOut} color="primary" aria-label="Sign out">
                <LogoutRoundedIcon />
              </IconButton>
            ) : null}
          </Stack>
        </Toolbar>
      </AppBar>
      ) : null}

      {!isAuthRoute ? (
        <Drawer
          anchor="left"
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { md: 'none' }, '& .MuiDrawer-paper': { width: '40%', boxSizing: 'border-box' } }}
        >
          <Box sx={{ pt: 2, pb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, py: 1, fontWeight: 700 }}>
              Navigation
            </Typography>
            {navList}
          </Box>
        </Drawer>
      ) : null}

      <Container
        maxWidth={isAuthRoute ? 'sm' : false}
        disableGutters={!isAuthRoute}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >

        {notice ? <Alert sx={{ mb: 2 }} severity="success">{notice}</Alert> : null}
        {error ? <Alert sx={{ mb: 2 }} severity="error">{error}</Alert> : null}

        <Grid container sx={{ flex: 1, alignItems: 'stretch', minHeight: 0 }}>
          {!isAuthRoute ? (
          <Grid sx={{ display: { xs: 'none', md: 'block' } }} width="20%">
            <Paper
              sx={{
                p: 1.2,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 12px 30px rgba(62, 39, 21, 0.06)',
                position: 'sticky',
                height: '93vh',
                width: '100%',
              }}
            >
              <Typography variant="subtitle2" color="text.secondary" sx={{ px: 1.5, py: 1, fontWeight: 700 }}>
                Navigation
              </Typography>
              {navList}
            </Paper>
          </Grid>
          ) : null}

          <Grid
            size={{ xs: 12, md: isAuthRoute ? 12 : 9 }}
            width="80%"
            sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0}}
          >
              <Routes>
                <Route
                  path="/auth/login"
                  element={
                    roleLabel === 'guest' ? (
                        <LoginPage
                          loginData={loginData}
                          setLoginData={setLoginData}
                          login={login}
                          onGoToSignup={() => navigate('/auth/signup')}
                        />
                    ) : (
                      <Navigate to={defaultPath} replace />
                    )
                  }
                />
                <Route
                  path="/auth/signup"
                  element={
                    roleLabel === 'guest' ? (
                        <SignupPage
                          registerData={registerData}
                          setRegisterData={setRegisterData}
                          register={register}
                          onGoToLogin={() => navigate('/auth/login')}
                        />
                    ) : (
                      <Navigate to={defaultPath} replace />
                    )
                  }
                />
                <Route
                  path="/profile"
                  element={
                    ['user', 'mentor', 'admin'].includes(roleLabel) ? (
                        <UserProfilePage user={auth?.user} onSaveProfile={updateProfile} />
                    ) : (
                      <Navigate to={defaultPath} replace />
                    )
                  }
                />
                <Route
                  path="/mentors"
                  element={
                    ['guest', 'user', 'mentor', 'admin'].includes(roleLabel) ? (
                        <MentorsPage
                          mentors={mentors}
                          loadMentors={loadMentors}
                          openMentor={(mentorId) => navigate(`/mentors/${mentorId}`)}
                        />
                    ) : (
                      <Navigate to={defaultPath} replace />
                    )
                  }
                />
                <Route
                  path="/mentors/:mentorId"
                  element={
                    ['guest', 'user', 'mentor', 'admin'].includes(roleLabel) ? (
                        <MentorProfilePage
                          loadMentor={loadMentor}
                          questionDraft={questionDraft}
                          setQuestionDraft={setQuestionDraft}
                          requestSession={requestSession}
                          canRequest={Boolean(auth.token)}
                        />
                    ) : (
                      <Navigate to={defaultPath} replace />
                    )
                  }
                />
                <Route
                  path="/mentorship/request"
                  element={
                    ['user', 'admin'].includes(roleLabel) ? (
                        <RequestMentorshipPage
                          mentors={mentors}
                          questionDraft={questionDraft}
                          setQuestionDraft={setQuestionDraft}
                          loadMentors={loadMentors}
                          requestSession={requestSession}
                        />
                    ) : (
                      <Navigate to={defaultPath} replace />
                    )
                  }
                />
                <Route
                  path="/sessions"
                  element={
                    ['user', 'mentor', 'admin'].includes(roleLabel) ? (
                        <SessionsPage
                          mySessions={mySessions}
                          role={auth?.user?.role}
                          loadMySessions={loadMySessions}
                          updateSession={updateSession}
                        />
                    ) : (
                      <Navigate to={defaultPath} replace />
                    )
                  }
                />
                <Route
                  path="/mentor/dashboard"
                  element={
                    roleLabel === 'mentor' ? (
                        <MentorDashboardPage
                          mySessions={mySessions}
                          onLoadSessions={loadMySessions}
                        />
                    ) : (
                      <Navigate to={defaultPath} replace />
                    )
                  }
                />
                <Route
                  path="/mentor/requests"
                  element={
                    roleLabel === 'mentor' ? (
                        <MentorRequestsPage
                          mySessions={mySessions}
                          updateSession={updateSession}
                          onRefresh={loadMySessions}
                        />
                    ) : (
                      <Navigate to={defaultPath} replace />
                    )
                  }
                />
                <Route
                  path="/admin"
                  element={
                    roleLabel === 'admin' ? (
                        <AdminHomePage
                          mentorsCount={mentors.length}
                          sessionsCount={mySessions.length}
                          adminUsers={adminUsers}
                          currentUserId={auth?.user?.id}
                          onLoadUsers={loadAdminUsers}
                          onSetUserRole={adminSetUserRole}
                          onGoToMentors={() => navigate('/mentors')}
                          onGoToSessions={() => navigate('/sessions')}
                        />
                    ) : (
                      <Navigate to={defaultPath} replace />
                    )
                  }
                />
                <Route path="*" element={<Navigate to={defaultPath} replace />} />
              </Routes>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

function MentorsPage({ mentors, loadMentors, openMentor }) {
  return (
    <Grid container spacing={2.5}>
      <Grid size={12}>
        <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
          <CardContent>
            <Stack
              direction="row"
              sx={{ mb: 2, justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Stack>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Mentors Directory</Typography>
                <Typography variant="body2" color="text.secondary">
                  Browse mentors and open their detailed profile.
                </Typography>
              </Stack>
              <Button size="small" variant="contained" onClick={loadMentors}>Refresh</Button>
            </Stack>
            <Stack spacing={1}>
              {mentors.map((m) => (
                <Paper key={m.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }} elevation={0}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                      <Avatar
                        src={m.profilePicture || undefined}
                        alt={m.username || ''}
                        imgProps={{ loading: 'lazy' }}
                        sx={{ width: 40, height: 40, bgcolor: 'primary.light', color: 'primary.contrastText' }}
                      >
                        {m.username?.[0]?.toUpperCase() || 'M'}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{m.username}</Typography>
                        <Typography variant="body2" color="text.secondary">{m.email}</Typography>
                      </Box>
                    </Stack>
                    <Button size="small" variant="outlined" onClick={() => openMentor(m.id)}>View Profile</Button>
                  </Stack>
                </Paper>
              ))}
              {!mentors.length ? <Typography color="text.secondary">Click refresh to load mentors.</Typography> : null}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

function SessionsPage({ mySessions, role, loadMySessions, updateSession }) {
  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          sx={{ mb: 2, gap: 1, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
        >
          <Stack>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>My Mentorship Sessions</Typography>
            <Typography variant="body2" color="text.secondary">
              Track all your requests and session statuses.
            </Typography>
          </Stack>
          <Button variant="contained" onClick={loadMySessions}>Refresh</Button>
        </Stack>
        <Stack spacing={1.5}>
          {mySessions.map((session) => (
            <Paper key={session.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider' }} elevation={0}>
              <Stack spacing={1}>
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} sx={{ justifyContent: 'space-between' }}>
                  <Typography>
                    <strong>Mentor:</strong> {session.mentor?.username} | <strong>Mentee:</strong> {session.mentee?.username}
                  </Typography>
                  <Chip
                    label={session.status}
                    color={statusColor[session.status] || 'default'}
                    size="small"
                    sx={{ textTransform: 'capitalize' }}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary"><strong>Questions:</strong> {(session.questions || []).join(' | ') || 'N/A'}</Typography>
                {role === 'mentor' ? (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button variant="contained" size="small" fullWidth onClick={() => updateSession(session.id, 'accept')}>Accept</Button>
                    <Button variant="outlined" size="small" fullWidth onClick={() => updateSession(session.id, 'decline')}>Decline</Button>
                  </Stack>
                ) : null}
              </Stack>
            </Paper>
          ))}
          {!mySessions.length ? <Typography color="text.secondary">No sessions yet.</Typography> : null}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default App
