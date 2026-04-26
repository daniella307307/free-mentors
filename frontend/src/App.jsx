import { useMemo, useState } from 'react'
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { gql } from 'graphql-request'
import { useDispatch, useSelector } from 'react-redux'
import { createClient } from './api'
import { clearAuth, setAuth } from './features/authSlice'

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

const MENTORS = gql`query { mentors { id username email role bio occupation expertise } }`
const MENTOR = gql`query Mentor($mentorId: String!) { mentor(mentorId: $mentorId) { id username email bio occupation expertise role } }`
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
const CHANGE_TO_MENTOR = gql`
  mutation Promote($userId: String!) {
    changeUserToMentor(userId: $userId) {
      success
      message
      user { id username role }
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

function App() {
  const dispatch = useDispatch()
  const auth = useSelector((state) => state.auth)
  const [tab, setTab] = useState(0)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' })
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [mentors, setMentors] = useState([])
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [questionDraft, setQuestionDraft] = useState('')
  const [mySessions, setMySessions] = useState([])
  const [promoteUserId, setPromoteUserId] = useState('')

  const client = useMemo(() => createClient(auth.token), [auth.token])
  const roleLabel = auth?.user?.role || 'guest'

  const safeRequest = async (run) => {
    setError('')
    setNotice('')
    try {
      await run()
    } catch (err) {
      setError(err?.response?.errors?.[0]?.message || err.message || 'Request failed.')
    }
  }

  const register = () =>
    safeRequest(async () => {
      const result = await client.request(REGISTER, registerData)
      if (!result.registerUser.success) return setError(result.registerUser.message)
      setNotice('Registration complete. You can now sign in.')
      setRegisterData({ username: '', email: '', password: '' })
    })

  const login = () =>
    safeRequest(async () => {
      const result = await client.request(LOGIN, loginData)
      if (!result.loginUser.success) return setError(result.loginUser.message)
      dispatch(setAuth({ token: result.loginUser.token, user: result.loginUser.user }))
      setNotice('Signed in successfully.')
    })

  const loadMentors = () =>
    safeRequest(async () => {
      const result = await client.request(MENTORS)
      setMentors(result.mentors || [])
      setNotice(`Loaded ${result.mentors?.length || 0} mentors.`)
    })

  const loadMentor = (mentorId) =>
    safeRequest(async () => {
      const result = await client.request(MENTOR, { mentorId })
      setSelectedMentor(result.mentor)
    })

  const requestSession = (mentorId) =>
    safeRequest(async () => {
      const questions = questionDraft
        .split('\n')
        .map((q) => q.trim())
        .filter(Boolean)
      const result = await client.request(CREATE_SESSION, { mentorId, questions })
      if (!result.createMentorshipSessionRequest.success) {
        return setError(result.createMentorshipSessionRequest.message)
      }
      setNotice('Mentorship request submitted.')
      setQuestionDraft('')
      loadMySessions()
    })

  const loadMySessions = () =>
    safeRequest(async () => {
      const result = await client.request(MY_SESSIONS)
      setMySessions(result.myMentorshipSessions || [])
    })

  const promoteToMentor = () =>
    safeRequest(async () => {
      const result = await client.request(CHANGE_TO_MENTOR, { userId: promoteUserId.trim() })
      if (!result.changeUserToMentor.success) return setError(result.changeUserToMentor.message)
      setNotice(`User promoted: ${result.changeUserToMentor.user.username}`)
      setPromoteUserId('')
    })

  const updateSession = (sessionId, action) =>
    safeRequest(async () => {
      const mutation = action === 'accept' ? ACCEPT_SESSION : DECLINE_SESSION
      const key = action === 'accept' ? 'acceptMentorshipSessionRequest' : 'declineMentorshipSessionRequest'
      const result = await client.request(mutation, { sessionId })
      if (!result[key].success) return setError(result[key].message)
      setNotice(`Session ${action}ed.`)
      loadMySessions()
    })

  const signOut = () => {
    dispatch(clearAuth())
    setSelectedMentor(null)
    setMySessions([])
    setNotice('Signed out.')
  }

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg,#f6f8ff 0%,#f7fbff 45%,#ffffff 100%)' }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #e7ebff' }}>
        <Toolbar sx={{ justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Free Mentors Console
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={`Role: ${roleLabel}`} color="primary" variant="outlined" />
            {auth.token ? (
              <IconButton onClick={signOut} color="primary">
                <LogoutRoundedIcon />
              </IconButton>
            ) : null}
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {notice ? <Alert sx={{ mb: 2 }} severity="success">{notice}</Alert> : null}
        {error ? <Alert sx={{ mb: 2 }} severity="error">{error}</Alert> : null}

        <Paper sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
          <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" allowScrollButtonsMobile>
            <Tab label="Auth" />
            <Tab label="Mentors" />
            <Tab label="Sessions" />
            <Tab label="Admin" />
          </Tabs>
        </Paper>

        {tab === 0 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Sign Up</Typography>
                  <Stack spacing={2}>
                    <TextField label="Username" value={registerData.username} onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })} />
                    <TextField label="Email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} />
                    <TextField type="password" label="Password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} />
                    <Button variant="contained" onClick={register}>Create account</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>Sign In</Typography>
                  <Stack spacing={2}>
                    <TextField label="Email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} />
                    <TextField type="password" label="Password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
                    <Button variant="contained" onClick={login}>Sign in</Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {tab === 1 && (
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="h6">Mentors</Typography>
                    <Button size="small" onClick={loadMentors}>Refresh</Button>
                  </Stack>
                  <Stack spacing={1}>
                    {mentors.map((m) => (
                      <Paper key={m.id} sx={{ p: 1.5, border: '1px solid #ecf0ff' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>{m.username}</Typography>
                            <Typography variant="body2">{m.email}</Typography>
                          </Box>
                          <Button size="small" onClick={() => loadMentor(m.id)}>Open</Button>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={7}>
              <Card sx={{ minHeight: 300 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>Mentor Details</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {selectedMentor ? (
                    <Stack spacing={1.5}>
                      <Typography><strong>Name:</strong> {selectedMentor.username}</Typography>
                      <Typography><strong>Email:</strong> {selectedMentor.email}</Typography>
                      <Typography><strong>Occupation:</strong> {selectedMentor.occupation || 'N/A'}</Typography>
                      <Typography><strong>Expertise:</strong> {selectedMentor.expertise || 'N/A'}</Typography>
                      <TextField
                        multiline
                        minRows={3}
                        label="Questions (one per line)"
                        value={questionDraft}
                        onChange={(e) => setQuestionDraft(e.target.value)}
                      />
                      <Button variant="contained" onClick={() => requestSession(selectedMentor.id)} disabled={!auth.token}>
                        Request mentorship session
                      </Button>
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">Select a mentor to view profile and request a session.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {tab === 2 && (
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6">My Mentorship Sessions</Typography>
                <Button onClick={loadMySessions}>Refresh</Button>
              </Stack>
              <Stack spacing={1.5}>
                {mySessions.map((session) => (
                  <Paper key={session.id} sx={{ p: 2, border: '1px solid #ecf0ff' }}>
                    <Stack spacing={1}>
                      <Typography>
                        <strong>Mentor:</strong> {session.mentor?.username} | <strong>Mentee:</strong> {session.mentee?.username}
                      </Typography>
                      <Typography><strong>Status:</strong> {session.status}</Typography>
                      <Typography variant="body2"><strong>Questions:</strong> {(session.questions || []).join(' | ') || 'N/A'}</Typography>
                      {auth?.user?.role === 'mentor' ? (
                        <Stack direction="row" spacing={1}>
                          <Button variant="contained" size="small" onClick={() => updateSession(session.id, 'accept')}>Accept</Button>
                          <Button variant="outlined" size="small" onClick={() => updateSession(session.id, 'decline')}>Decline</Button>
                        </Stack>
                      ) : null}
                    </Stack>
                  </Paper>
                ))}
                {!mySessions.length ? <Typography color="text.secondary">No sessions yet.</Typography> : null}
              </Stack>
            </CardContent>
          </Card>
        )}

        {tab === 3 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Admin - Promote User to Mentor</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  fullWidth
                  label="User ID"
                  value={promoteUserId}
                  onChange={(e) => setPromoteUserId(e.target.value)}
                />
                <Button variant="contained" onClick={promoteToMentor}>Promote</Button>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                Use an admin token account to run this action.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  )
}

export default App
