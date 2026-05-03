import { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import { useNavigate, useParams } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import PageHeader from '../components/ui/PageHeader'
import StarRatingDisplay from '../components/StarRatingDisplay'

function sessionMentorId(session) {
  const id = session?.mentor?.id
  return id != null ? String(id) : ''
}

export default function MentorProfilePage({
  loadMentor,
  loadingMentor = false,
  reviews = [],
  loadReviews,
  reviewDraft,
  setReviewDraft,
  submitReview,
  loadingReviews = false,
  submittingReview = false,
  flaggingReview = false,
  currentUserId,
  userRole,
  mySessions = [],
  isLoggedIn,
  onFlagReview,
  onAdminSetReviewHidden,
  updatingReviewModeration = false,
}) {
  const navigate = useNavigate()
  const { mentorId } = useParams()
  const [mentor, setMentor] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const [internalReviewsLoading, setInternalReviewsLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const viewerHasCompletedSession = useMemo(() => {
    if (!isLoggedIn || !currentUserId || !mentorId) return false
    const mid = String(mentorId)
    return mySessions.some(
      (s) =>
        sessionMentorId(s) === mid &&
        s.status === 'completed' &&
        String(s.mentee?.id) === String(currentUserId),
    )
  }, [isLoggedIn, currentUserId, mentorId, mySessions])

  const isOwnMentorProfile =
    Boolean(mentor && currentUserId && userRole === 'mentor' && String(mentor.id) === String(currentUserId))

  const canWriteReview = isLoggedIn && userRole === 'user' && viewerHasCompletedSession
  const canRequestAsUser = userRole === 'user' && !isOwnMentorProfile
  const canModerateAsMentor = isLoggedIn && userRole === 'mentor' && isOwnMentorProfile
  const canModerateAsAdmin = isLoggedIn && userRole === 'admin'

  const reviewsLoading = internalReviewsLoading || loadingReviews

  useEffect(() => {
    let alive = true
    const run = async () => {
      if (!mentorId) return
      setShowReviewForm(false)
      setProfileLoading(true)
      setMentor(null)
      const data = await loadMentor(mentorId)
      if (alive) {
        setMentor(data || null)
        setProfileLoading(false)
      }
    }
    run()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentorId])

  useEffect(() => {
    if (!mentorId || !loadReviews) return
    let alive = true
    const run = async () => {
      setInternalReviewsLoading(true)
      await loadReviews(mentorId)
      if (alive) setInternalReviewsLoading(false)
    }
    run()
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentorId])

  const showReviewFormVisible = canWriteReview && showReviewForm

  const goRequestMentorship = () => {
    if (!mentor) return
    navigate('/request-mentorship', {
      state: {
        preselectedMentorId: mentor.id,
        mentor: {
          id: mentor.id,
          username: mentor.username,
          email: mentor.email,
        },
      },
    })
  }

  const handleFlag = (review) => {
    if (!mentorId || !onFlagReview || !review?.id) return
    onFlagReview(review.id, mentorId)
  }

  const handleAdminHidden = (review, hidden) => {
    if (!mentorId || !onAdminSetReviewHidden || !review?.id) return
    onAdminSetReviewHidden(review.id, hidden, mentorId)
  }

  return (
    <Card sx={{ border: '1px solid', borderColor: 'divider' }} elevation={0}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <PageHeader
          title="Mentor profile"
          subtitle="Learn about this mentor’s background and expertise."
          action={
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate('/mentors')}
              sx={{ borderColor: 'divider', fontWeight: 700 }}
            >
              Back to directory
            </Button>
          }
        />
        <Divider sx={{ mb: 3 }} />

        {profileLoading || loadingMentor ? (
          <LoadingState label="Loading mentor profile…" />
        ) : mentor ? (
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'flex-start' } }}>
              <Avatar
                src={mentor.profilePicture || undefined}
                alt={mentor.username || ''}
                imgProps={{ loading: 'lazy' }}
                sx={{
                  width: 88,
                  height: 88,
                  bgcolor: 'secondary.light',
                  color: 'secondary.contrastText',
                  fontSize: '2rem',
                  fontWeight: 800,
                }}
              >
                {mentor.username?.[0]?.toUpperCase() || 'M'}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {mentor.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {mentor.email}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.75 }}>
                  <Chip size="small" label={mentor.role || 'mentor'} color="primary" variant="outlined" />
                  {mentor.occupation ? <Chip size="small" variant="outlined" label={mentor.occupation} /> : null}
                  {mentor.averageRating ? (
                    <StarRatingDisplay
                      value={mentor.averageRating}
                      label={`(${mentor.reviewsCount || 0})`}
                      size="small"
                    />
                  ) : null}
                </Stack>

                {canRequestAsUser ? (
                  <Button variant="contained" size="large" sx={{ mt: 2 }} onClick={goRequestMentorship}>
                    Request mentorship
                  </Button>
                ) : !isLoggedIn ? (
                  <Button variant="contained" size="large" sx={{ mt: 2 }} onClick={() => navigate('/auth/login')}>
                    Sign in to request mentorship
                  </Button>
                ) : userRole === 'mentor' && isOwnMentorProfile ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 520 }}>
                    This is your public mentor profile. Mentees can book sessions with you from the directory; you
                    cannot request a session with yourself.
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, maxWidth: 480 }}>
                    Mentorship requests are available to mentee accounts. Admins browse profiles in read-only mode.
                  </Typography>
                )}
              </Box>
            </Stack>

            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Expertise
              </Typography>
              <Typography>{mentor.expertise || 'Not specified yet.'}</Typography>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Bio
              </Typography>
              <Typography sx={{ lineHeight: 1.65 }}>{mentor.bio || 'This mentor has not added a bio yet.'}</Typography>
            </Stack>

            <Divider />

            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Reviews
              </Typography>
              {canWriteReview ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                  <Button variant="outlined" onClick={() => setShowReviewForm((v) => !v)} sx={{ alignSelf: 'flex-start' }}>
                    {showReviewForm ? 'Close review form' : 'Write review'}
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    You completed a session with this mentor; share a star rating and optional comment.
                  </Typography>
                </Stack>
              ) : null}

              {showReviewFormVisible ? (
                <Stack spacing={2} sx={{ pt: 0.5 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                    <Typography component="span" variant="body2" sx={{ fontWeight: 700 }}>
                      Your rating
                    </Typography>
                    <Rating
                      name="mentor-review-rating"
                      value={Number(reviewDraft?.rating) || 5}
                      onChange={(_, value) => setReviewDraft((prev) => ({ ...prev, rating: value || 5 }))}
                      size="large"
                      sx={{ color: 'primary.main' }}
                    />
                  </Stack>
                  <TextField
                    fullWidth
                    label="Comment"
                    placeholder="Write a short review"
                    value={reviewDraft?.comment || ''}
                    onChange={(e) => setReviewDraft((prev) => ({ ...prev, comment: e.target.value }))}
                  />
                  <Button
                    variant="contained"
                    onClick={() => submitReview(mentor.id)}
                    disabled={submittingReview}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {submittingReview ? 'Submitting…' : 'Submit review'}
                  </Button>
                </Stack>
              ) : null}

              {reviewsLoading ? <LoadingState label="Loading reviews…" compact /> : null}
              {!reviewsLoading && !reviews.length ? (
                <Typography variant="body2" color="text.secondary">
                  No reviews yet for this mentor.
                </Typography>
              ) : null}
              <Stack spacing={1.25}>
                {reviews.map((review) => (
                  <Box
                    key={review.id}
                    sx={{ p: 1.75, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
                  >
                    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontWeight: 700 }}>{review.reviewer?.username || 'Anonymous'}</Typography>
                      <StarRatingDisplay value={review.rating} />
                    </Stack>
                    <Stack direction="row" spacing={0.75} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                      {review.flagged ? <Chip size="small" color="warning" label="Flagged" variant="outlined" /> : null}
                      {review.hidden ? <Chip size="small" label="Hidden" variant="outlined" /> : null}
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 0.75 }}>
                      {review.comment || 'No comment provided.'}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: 'wrap' }}>
                      {canModerateAsMentor ? (
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          startIcon={<FlagOutlinedIcon fontSize="small" />}
                          disabled={Boolean(review.flagged) || flaggingReview}
                          onClick={() => handleFlag(review)}
                        >
                          {review.flagged ? 'Flagged' : 'Flag as inappropriate'}
                        </Button>
                      ) : null}
                      {canModerateAsAdmin ? (
                        <>
                          {!review.hidden ? (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              disabled={updatingReviewModeration}
                              onClick={() => handleAdminHidden(review, true)}
                            >
                              Hide review
                            </Button>
                          ) : (
                            <Button
                              size="small"
                              variant="outlined"
                              disabled={updatingReviewModeration}
                              onClick={() => handleAdminHidden(review, false)}
                            >
                              Unhide review
                            </Button>
                          )}
                        </>
                      ) : null}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Stack>
        ) : (
          <LoadingState label="Mentor profile unavailable." />
        )}
      </CardContent>
    </Card>
  )
}
