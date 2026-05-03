import { useEffect, useMemo } from 'react'
import { Box, Button, Container, Stack } from '@mui/material'
import FeaturesSection from '../components/home/FeaturesSection'
import HeroSection from '../components/home/HeroSection'
import HowItWorks from '../components/home/HowItWorks'
import MentorsPreview from '../components/home/MentorsPreview'
import TestimonialsSection from '../components/home/TestimonialsSection'

function pickPreviewMentors(mentors) {
  const raw = mentors || []
  const scored = raw
    .map((m) => {
      const bio = (m.bio || '').trim()
      const expertise = (m.expertise || '').trim()
      const occupation = (m.occupation || '').trim()
      const hasBio = bio.length >= 30
      const hasExpertise = expertise.length >= 5
      const hasOccupation = occupation.length >= 2
      const score = bio.length + expertise.length + occupation.length + (hasBio ? 50 : 0) + (hasExpertise ? 30 : 0)
      return { mentor: m, score, complete: hasBio && hasExpertise && hasOccupation }
    })
    .sort((a, b) => b.score - a.score)

  const complete = scored.filter((x) => x.complete).map((x) => x.mentor)
  const rest = scored.filter((x) => !x.complete).map((x) => x.mentor)
  const merged = [...complete, ...rest]
  return merged.slice(0, 6)
}

export default function HomePage({
  isLoggedIn = false,
  mentors = [],
  reviews = [],
  onRefresh,
  loadingMentors = false,
  loadingReviews = false,
  onGetStarted,
  onExploreMentors,
  onGoToDashboard,
  onBrowseMentors,
  onOpenMentor,
  showMobileGuestNav = false,
  onGoToLogin,
}) {
  const previewMentors = useMemo(() => pickPreviewMentors(mentors), [mentors])

  useEffect(() => {
    onRefresh?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Stack
      component="article"
      spacing={0}
      sx={{
        // Extra space on mobile: guest bottom bar + footer
        pb: showMobileGuestNav ? { xs: 14, md: 4 } : { xs: 2, md: 0 },
      }}
    >
      <Container maxWidth="lg" sx={{ pt: { xs: 8, sm: 8 }, pb: 0 }}>
        <HeroSection
          isLoggedIn={isLoggedIn}
          onGetStarted={onGetStarted}
          onExploreMentors={onExploreMentors}
          onGoToDashboard={onGoToDashboard}
          onBrowseMentors={onBrowseMentors}
        />
      </Container>

      <FeaturesSection />

      <MentorsPreview
        mentors={previewMentors}
        loading={loadingMentors}
        maxDisplay={6}
        onViewAll={onBrowseMentors}
        onViewProfile={onOpenMentor}
      />

      <HowItWorks />

      <TestimonialsSection reviews={reviews} loading={loadingReviews} />

      {showMobileGuestNav ? (
        <Box
          sx={{
            display: { xs: 'block', md: 'none' },
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: (theme) => theme.zIndex.appBar,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: 2,
            py: 1.25,
          }}
        >
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button variant="contained" size="medium" onClick={onExploreMentors} sx={{ flex: 1, maxWidth: 200 }}>
              Mentors
            </Button>
            <Button variant="outlined" size="medium" onClick={onGoToLogin} sx={{ flex: 1, maxWidth: 200 }}>
              Log in
            </Button>
          </Stack>
        </Box>
      ) : null}
    </Stack>
  )
}
