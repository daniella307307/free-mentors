import { useEffect, useMemo, useState } from 'react'
import { Alert, Box, Snackbar, useMediaQuery, useTheme } from '@mui/material'
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded'
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import HomeIcon from '@mui/icons-material/Home'
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import PersonIcon from '@mui/icons-material/Person'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  ACCEPT_SESSION,
  ADMIN_SET_MENTOR_REVIEW_HIDDEN,
  ADMIN_SET_USER_ROLE,
  ALL_USERS,
  CREATE_MENTOR_REVIEW,
  CREATE_SESSION,
  DECLINE_SESSION,
  FLAGGED_MENTOR_REVIEWS,
  FLAG_MENTOR_REVIEW,
  LOGIN,
  ME,
  MENTOR,
  MENTOR_REVIEWS,
  MENTORS,
  MY_SESSIONS,
  RECENT_REVIEWS,
  REGISTER,
  UPDATE_PROFILE,
} from './api/graphql'
import { getStoredToken } from './api'
import { request } from './api/request'
import AppShell from './components/layout/AppShell'
import AppNavigation from './components/layout/AppNavigation'
import AdminHomePage from './pages/AdminHomePage'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import MenteeDashboardPage from './pages/MenteeDashboardPage'
import MentorDashboardPage from './pages/MentorDashboardPage'
import MentorProfilePage from './pages/MentorProfilePage'
import MentorRequestsPage from './pages/MentorRequestsPage'
import MentorsPage from './pages/MentorsPage'
import RequestMentorshipPage from './pages/RequestMentorshipPage'
import SessionsPage from './pages/SessionsPage'
import SignupPage from './pages/SignupPage'
import UserProfilePage from './pages/UserProfilePage'
import { clearAuth, setAuth } from './features/authSlice'

const navItems = [
  { key: 'home', path: '/', label: 'Home', icon: <HomeIcon fontSize="small" />, roles: ['guest', 'user', 'mentor', 'admin'] },
  { key: 'login', path: '/auth/login', label: 'Login', icon: <LockOpenRoundedIcon fontSize="small" />, roles: ['guest'] },
  { key: 'signup', path: '/auth/signup', label: 'Sign Up', icon: <PersonAddAlt1RoundedIcon fontSize="small" />, roles: ['guest'] },
  { key: 'mentors', path: '/mentors', label: 'Mentors', icon: <GroupsRoundedIcon fontSize="small" />, roles: ['guest', 'user', 'mentor'] },
  { key: 'request-mentorship', path: '/request-mentorship', label: 'Request Mentorship', icon: <PersonAddAlt1RoundedIcon fontSize="small" />, roles: ['user'] },
  { key: 'sessions', path: '/sessions', label: 'My Sessions', icon: <EventNoteRoundedIcon fontSize="small" />, roles: ['user', 'mentor'] },
  //{ key: 'mentor-dashboard', path: '/mentor/dashboard', label: 'Mentor Dashboard', icon: <HomeIcon fontSize="small" />, roles: ['mentor'] },
  { key: 'mentor-requests', path: '/mentor/requests', label: 'Mentor Requests', icon: <EventNoteRoundedIcon fontSize="small" />, roles: ['mentor'] },
  // { key: 'admin', path: '/admin', label: 'Admin Overview', icon: <AdminPanelSettingsRoundedIcon fontSize="small" />, roles: ['admin'] },
  { key: 'profile', path: '/profile', label: 'Profile', icon: <PersonIcon fontSize="small" />, roles: ['user', 'mentor', 'admin'] },
]

const homePathByRole = {
  guest: '/',
  user: '/',
  mentor: '/',
  admin: '/',
}

function App() {
  const theme = useTheme()
  const isMobileNav = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const auth = useSelector((state) => state.auth)
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' })
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' })
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [mentors, setMentors] = useState([])
  const [questionDraft, setQuestionDraft] = useState('')
  const [mySessions, setMySessions] = useState([])
  const [adminUsers, setAdminUsers] = useState([])
  const [mentorReviews, setMentorReviews] = useState([])
  const [recentReviews, setRecentReviews] = useState([])
  const [flaggedMentorReviews, setFlaggedMentorReviews] = useState([])
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, comment: '' })
  const [loading, setLoading] = useState({})

  const roleLabel = auth?.user?.role || 'guest'
  const mentorsForDirectory = useMemo(() => {
    const selfId = auth?.user?.id
    if (roleLabel !== 'mentor' || !selfId) return mentors
    return mentors.filter((m) => String(m.id) !== String(selfId))
  }, [mentors, roleLabel, auth?.user?.id])
  const availableNavItems = useMemo(
    () => navItems.filter((item) => item.roles.includes(roleLabel)),
    [roleLabel],
  )
  const defaultPath = homePathByRole[roleLabel] || '/auth/login'
  const isBusy = (key) => Boolean(loading[key])

  useEffect(() => {
    if (!auth?.token) return
    let cancelled = false
    request(ME)
      .then((data) => {
        if (cancelled || !data?.me) return
        const token = getStoredToken()
        if (token) dispatch(setAuth({ token, user: data.me }))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [auth?.token, dispatch])

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity })
  }

  const closeToast = () => {
    setToast((prev) => ({ ...prev, open: false }))
  }

  const withLoading = async (key, run) => {
    setLoading((prev) => ({ ...prev, [key]: true }))
    try {
      return await run()
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }))
    }
  }

  const safeRequest = async (run) => {
    try {
      return await run()
    } catch (err) {
      showToast(err?.response?.errors?.[0]?.message || err.message || 'Request failed.', 'error')
      return undefined
    }
  }

  const register = () =>
    withLoading('register', () =>
      safeRequest(async () => {
        const { email, password } = registerData
        const result = await request(REGISTER, registerData)
        if (!result.registerUser.success) {
          showToast(result.registerUser.message, 'error')
          return
        }
        setRegisterData({ username: '', email: '', password: '' })

        const loginResult = await request(LOGIN, { email, password })
        if (!loginResult?.loginUser?.success) {
          showToast('Account created. Please sign in with your email and password.', 'success')
          setLoginData((prev) => ({ ...prev, email }))
          navigate('/auth/login')
          return
        }

        const user = loginResult.loginUser.user
        dispatch(setAuth({ token: loginResult.loginUser.token, user }))
        showToast('Welcome! Your account is ready.', 'success')
        const role = user?.role || 'user'
        navigate(homePathByRole[role] || '/mentors')
      }),
    )

  const login = () =>
    withLoading('login', () =>
      safeRequest(async () => {
        const result = await request(LOGIN, loginData)
        if (!result.loginUser.success) {
          showToast(result.loginUser.message, 'error')
          return
        }
        dispatch(setAuth({ token: result.loginUser.token, user: result.loginUser.user }))
        showToast('Signed in successfully.', 'success')
      }),
    )

  const updateProfile = (payload) =>
    withLoading('profile', () =>
      safeRequest(async () => {
        const result = await request(UPDATE_PROFILE, payload)
        if (!result.updateMyProfile.success) {
          showToast(result.updateMyProfile.message, 'error')
          return false
        }
        dispatch(setAuth({ token: auth.token, user: result.updateMyProfile.user }))
        showToast(result.updateMyProfile.message || 'Profile updated.', 'success')
        return true
      }),
    )

  const loadMentors = (options = {}) =>
    withLoading('mentors', () =>
      safeRequest(async () => {
        const result = await request(MENTORS)
        setMentors(result.mentors || [])
        if (options.notify) {
          showToast(`Loaded ${result.mentors?.length || 0} mentors.`, 'success')
        }
      }),
    )

  const loadMentor = async (mentorId) =>
    withLoading('mentorProfile', () =>
      safeRequest(async () => {
        const result = await request(MENTOR, { mentorId })
        return result.mentor
      }),
    )

  const requestSession = (mentorId, sessionDate, sessionTime) =>
    withLoading('requestSession', () =>
      safeRequest(async () => {
        const questions = questionDraft
          .split('\n')
          .map((q) => q.trim())
          .filter(Boolean)
        const sessionSlot = `${sessionDate} ${sessionTime}`
        const result = await request(CREATE_SESSION, { mentorId, sessionDate, sessionTime, sessionSlot, questions })
        if (!result.createMentorshipSessionRequest.success) {
          showToast(result.createMentorshipSessionRequest.message, 'error')
          return
        }
        showToast('Mentorship request submitted.', 'success')
        setQuestionDraft('')
        loadMySessions()
      }),
    )

  const loadMentorReviews = (mentorId) =>
    withLoading('mentorReviews', () =>
      safeRequest(async () => {
        setMentorReviews([])
        const result = await request(MENTOR_REVIEWS, { mentorId })
        setMentorReviews(result.mentorReviews || [])
      }),
    )

  const loadRecentReviews = (limit = 6) =>
    withLoading('recentReviews', () =>
      safeRequest(async () => {
        const result = await request(RECENT_REVIEWS, { limit })
        setRecentReviews(result.recentReviews || [])
      }),
    )

  const submitMentorReview = (mentorId) =>
    withLoading('reviewSubmit', () =>
      safeRequest(async () => {
        const result = await request(CREATE_MENTOR_REVIEW, {
          mentorId,
          rating: Number(reviewDraft.rating),
          comment: reviewDraft.comment?.trim() || '',
        })
        if (!result.createMentorReview.success) {
          showToast(result.createMentorReview.message, 'error')
          return
        }
        showToast(result.createMentorReview.message || 'Review submitted.', 'success')
        setReviewDraft((prev) => ({ ...prev, comment: '' }))
        loadMentorReviews(mentorId)
      }),
    )

  const loadFlaggedMentorReviews = () =>
    withLoading('flaggedMentorReviews', () =>
      safeRequest(async () => {
        const result = await request(FLAGGED_MENTOR_REVIEWS)
        setFlaggedMentorReviews(result.flaggedMentorReviews || [])
      }),
    )

  const flagMentorReview = (reviewId, mentorId) =>
    withLoading('flagReview', () =>
      safeRequest(async () => {
        const result = await request(FLAG_MENTOR_REVIEW, { reviewId })
        const payload = result.flagMentorReview
        if (!payload.success) {
          showToast(payload.message, 'error')
          return
        }
        showToast(payload.message || 'Review flagged.', 'success')
        await loadMentorReviews(mentorId)
      }),
    )

  const adminSetMentorReviewHidden = (reviewId, hidden, mentorId) =>
    withLoading('adminReviewModeration', () =>
      safeRequest(async () => {
        const result = await request(ADMIN_SET_MENTOR_REVIEW_HIDDEN, { reviewId, hidden })
        const payload = result.adminSetMentorReviewHidden
        if (!payload.success) {
          showToast(payload.message, 'error')
          return
        }
        showToast(payload.message || 'Updated.', 'success')
        if (mentorId) {
          await loadMentorReviews(mentorId)
        }
        await loadFlaggedMentorReviews()
      }),
    )

  const loadMySessions = () =>
    withLoading('sessions', () =>
      safeRequest(async () => {
        const result = await request(MY_SESSIONS)
        setMySessions(result.myMentorshipSessions || [])
      }),
    )

  const loadHomepageData = async () => {
    await Promise.all([
      loadMentors(),
      loadRecentReviews(6),
      auth.token ? loadMySessions() : Promise.resolve(),
    ])
  }

  useEffect(() => {
    if (location.pathname !== '/' || !auth.token || roleLabel === 'guest') return
    void loadHomepageData()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load on / when session becomes authenticated
  }, [location.pathname, auth.token, roleLabel])

  const loadAdminUsers = () =>
    withLoading('adminUsers', () =>
      safeRequest(async () => {
        const result = await request(ALL_USERS)
        setAdminUsers(result.allUsers ?? [])
      }),
    )

  const adminSetUserRole = (userId, role) =>
    withLoading('setRole', () =>
      safeRequest(async () => {
        const result = await request(ADMIN_SET_USER_ROLE, { userId, role })
        const payload = result.adminSetUserRole
        if (!payload.success) {
          showToast(payload.message, 'error')
          return
        }
        const listResult = await request(ALL_USERS)
        setAdminUsers(listResult.allUsers ?? [])
        showToast(payload.message || 'Role updated.', 'success')
      }),
    )

  const sessionActionBusy = (sessionId) => isBusy(`session:${sessionId}`)

  const updateSession = (sessionId, action) =>
    withLoading(`session:${sessionId}`, () =>
      safeRequest(async () => {
        const mutation = action === 'accept' ? ACCEPT_SESSION : DECLINE_SESSION
        const key = action === 'accept' ? 'acceptMentorshipSessionRequest' : 'declineMentorshipSessionRequest'
        const result = await request(mutation, { sessionId })
        if (!result[key].success) {
          showToast(result[key].message, 'error')
          return
        }
        showToast(`Session ${action}ed.`, 'success')
        loadMySessions()
      }),
    )

  const signOut = () => {
    dispatch(clearAuth())
    setMySessions([])
    showToast('Signed out.', 'success')
    navigate('/auth/login')
  }

  const isAuthRoute = location.pathname.startsWith('/auth')
  const showNavigationSidebar = !isAuthRoute && Boolean(auth.token)
  const canBrowseMentors = ['guest', 'user', 'mentor'].includes(roleLabel)
  const canUseSessions = ['user', 'mentor'].includes(roleLabel)
  const canRequestMentorshipRoute = roleLabel === 'user'

  const navList = (
    <AppNavigation
      items={availableNavItems}
      pathname={location.pathname}
      onNavigate={(path) => {
        navigate(path)
        setMobileNavOpen(false)
      }}
    />
  )

  const adminHomeProps = {
    mentorsCount: mentors.length,
    sessionsCount: mySessions.length,
    adminUsers,
    currentUserId: auth?.user?.id,
    onLoadUsers: loadAdminUsers,
    onSetUserRole: adminSetUserRole,
    loadingUsers: isBusy('adminUsers'),
    updatingRole: isBusy('setRole'),
    flaggedMentorReviews,
    onLoadFlaggedReviews: loadFlaggedMentorReviews,
    onSetReviewHidden: adminSetMentorReviewHidden,
    loadingFlaggedReviews: isBusy('flaggedMentorReviews'),
    updatingReviewModeration: isBusy('adminReviewModeration'),
  }

  const homePageElement = (
    <HomePage
      isLoggedIn={false}
      mentors={mentorsForDirectory}
      reviews={recentReviews}
      onRefresh={loadHomepageData}
      loadingMentors={isBusy('mentors')}
      loadingReviews={isBusy('recentReviews')}
      onGetStarted={() => navigate('/auth/signup')}
      onExploreMentors={() => navigate('/mentors')}
      onGoToDashboard={() => navigate('/sessions')}
      onBrowseMentors={() => navigate('/mentors')}
      onOpenMentor={(mentorId) => navigate(`/mentors/${mentorId}`)}
      showMobileGuestNav={roleLabel === 'guest'}
      onGoToLogin={() => navigate('/auth/login')}
    />
  )

  const authenticatedHomeContent = (
    <Box
      id="home-dashboard"
      component="section"
      sx={{
        scrollMarginTop: { xs: 14, sm: 10 },
        px: { xs: 2, sm: 3 },
        pb: { xs: 3, sm: 4 },
        pt: { xs: 1, sm: 2 },
        maxWidth: 'lg',
        width: '100%',
        mx: 'auto',
      }}
    >
      {roleLabel === 'user' ? (
        <MenteeDashboardPage
          mySessions={mySessions}
          loadMySessions={loadMySessions}
          loadingSessions={isBusy('sessions')}
        />
      ) : roleLabel === 'mentor' ? (
        <MentorDashboardPage
          mySessions={mySessions}
          onLoadSessions={loadMySessions}
          loadingSessions={isBusy('sessions')}
          mentorUserId={auth?.user?.id}
          onViewPublicProfile={(id) => navigate(`/mentors/${id}`)}
        />
      ) : roleLabel === 'admin' ? (
        <AdminHomePage {...adminHomeProps} />
      ) : null}
    </Box>
  )

  return (
    <>
      <AppShell
        isAuthRoute={isAuthRoute}
        showNavigationSidebar={showNavigationSidebar}
        isMobileNav={isMobileNav}
        mobileNavOpen={mobileNavOpen}
        onMobileNavOpen={() => setMobileNavOpen(true)}
        onMobileNavClose={() => setMobileNavOpen(false)}
        navList={navList}
        roleLabel={roleLabel}
        showSignOut={Boolean(auth.token)}
        onSignOut={signOut}
      >
        <Routes>
          <Route path="/" element={roleLabel === 'guest' ? homePageElement : authenticatedHomeContent} />
          <Route
            path="/auth/login"
            element={
              roleLabel === 'guest' ? (
                <LoginPage
                  loginData={loginData}
                  setLoginData={setLoginData}
                  login={login}
                  loading={isBusy('login')}
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
                  loading={isBusy('register')}
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
                
                <UserProfilePage
                  user={auth?.user}
                  onSaveProfile={updateProfile}
                  loading={isBusy('profile')}
                  onViewPublicMentorProfile={
                    roleLabel === 'mentor' && auth?.user?.id
                      ? () => navigate(`/mentors/${auth.user.id}`)
                      : undefined
                  }
                />
              ) : (
                <Navigate to={defaultPath} replace />
              )
            }
          />
          <Route
            path="/mentors"
            element={
              canBrowseMentors ? (
                <MentorsPage
                  mentors={mentorsForDirectory}
                  loadMentors={loadMentors}
                  loading={isBusy('mentors')}
                  openMentor={(mentorId) => navigate(`/mentors/${mentorId}`)}
                  viewerRole={roleLabel}
                  viewerId={auth?.user?.id}
                />
              ) : (
                <Navigate to={defaultPath} replace />
              )
            }
          />
          <Route
            path="/mentors/:mentorId"
            element={
              canBrowseMentors ? (
                <MentorProfilePage
                  loadMentor={loadMentor}
                  loadingMentor={isBusy('mentorProfile')}
                  reviews={mentorReviews}
                  loadReviews={loadMentorReviews}
                  reviewDraft={reviewDraft}
                  setReviewDraft={setReviewDraft}
                  submitReview={submitMentorReview}
                  loadingReviews={isBusy('mentorReviews')}
                  submittingReview={isBusy('reviewSubmit')}
                  flaggingReview={isBusy('flagReview')}
                  currentUserId={auth?.user?.id}
                  userRole={roleLabel}
                  mySessions={mySessions}
                  isLoggedIn={Boolean(auth.token)}
                  onFlagReview={flagMentorReview}
                  onAdminSetReviewHidden={adminSetMentorReviewHidden}
                  updatingReviewModeration={isBusy('adminReviewModeration')}
                />
              ) : (
                <Navigate to={defaultPath} replace />
              )
            }
          />
          <Route
            path="/mentorship/request"
            element={<Navigate to="/request-mentorship" replace />}
          />
          <Route
            path="/request-mentorship"
            element={
              canRequestMentorshipRoute ? (
                <RequestMentorshipPage
                  key={`req-${location.key}-${location.state?.preselectedMentorId ?? 'none'}`}
                  preselectedMentorId={location.state?.preselectedMentorId}
                  mentors={mentors}
                  questionDraft={questionDraft}
                  setQuestionDraft={setQuestionDraft}
                  loadMentors={loadMentors}
                  requestSession={requestSession}
                  loadingMentors={isBusy('mentors')}
                  submittingRequest={isBusy('requestSession')}
                />
              ) : (
                <Navigate to={defaultPath} replace />
              )
            }
          />
          <Route
            path="/sessions"
            element={
              canUseSessions ? (
                <SessionsPage
                  mySessions={mySessions}
                  role={auth?.user?.role}
                  loadMySessions={loadMySessions}
                  updateSession={updateSession}
                  loadingSessions={isBusy('sessions')}
                  sessionActionBusy={sessionActionBusy}
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
                  loadingSessions={isBusy('sessions')}
                  mentorUserId={auth?.user?.id}
                  onViewPublicProfile={(id) => navigate(`/mentors/${id}`)}
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
                  loadingSessions={isBusy('sessions')}
                  sessionActionBusy={sessionActionBusy}
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
                <AdminHomePage {...adminHomeProps} />
              ) : (
                <Navigate to={defaultPath} replace />
              )
            }
          />
          <Route path="*" element={<Navigate to={defaultPath} replace />} />
        </Routes>
      </AppShell>

      <Snackbar
        open={toast.open}
        autoHideDuration={toast.severity === 'error' ? 8000 : 5200}
        onClose={closeToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: { xs: 7, sm: 2 } }}
      >
        <Alert
          onClose={closeToast}
          severity={toast.severity}
          variant="filled"
          elevation={0}
          sx={{ width: '100%', maxWidth: 420, alignItems: 'center' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default App
