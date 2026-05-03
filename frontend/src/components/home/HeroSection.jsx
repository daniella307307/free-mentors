import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { alpha, keyframes } from "@mui/material/styles";

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export default function HeroSection({
  isLoggedIn = false,
  onGetStarted,
  onExploreMentors,
  onGoToDashboard,
  onBrowseMentors,
}) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: { xs: 3, md: 4 },
        background: (theme) =>
          `linear-gradient(135deg,
    ${alpha(theme.palette.primary.main, 0.08)} 0%,
    ${alpha(theme.palette.secondary.main, 0.06)} 50%,
    ${alpha(theme.palette.background.default, 0.9)} 100%
  )`,
        border: "1px solid",
        borderColor: "divider",
        py: { xs: 5, sm: 7, md: 8 },
        px: { xs: 2, sm: 3 },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: (theme) =>
            `radial-gradient(600px 280px at 85% 10%, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 65%),
             radial-gradient(480px 240px at 0% 100%, ${alpha(theme.palette.secondary.main, 0.15)} 0%, transparent 60%)`,
          pointerEvents: "none",
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack
          spacing={2.5}
          sx={{
            maxWidth: 720,
            animation: `${fadeInUp} 0.65s ease-out both`,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              letterSpacing: 2,
              fontWeight: 800,
              color: "primary.main",
            }}
          >
            Free Mentors
          </Typography>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
              lineHeight: 1.15,
            }}
          >
            Connect with Mentors. Grow Your Future.
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontWeight: 400, lineHeight: 1.6, maxWidth: 640 }}
          >
            Match with experienced professionals, book focused mentorship
            sessions, and get guidance tailored to your goals — whether you are
            changing careers, skilling up, or planning your next move.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            sx={{ pt: 1 }}
          >
            {isLoggedIn ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={onGoToDashboard}
                  sx={{
                    py: 1.35,
                    px: 3,
                    fontWeight: 800,
                    boxShadow: 3,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={onBrowseMentors}
                  sx={{
                    py: 1.35,
                    px: 3,
                    fontWeight: 700,
                    borderColor: "divider",
                    bgcolor: (theme) =>
                      alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: "blur(8px)",
                    transition:
                      "transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: "primary.main",
                      bgcolor: (theme) =>
                        alpha(theme.palette.background.paper, 0.95),
                    },
                  }}
                >
                  Browse Mentors
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={onGetStarted}
                  sx={{
                    py: 1.35,
                    px: 3,
                    fontWeight: 800,
                    boxShadow: 3,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  Get Started
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={onExploreMentors}
                  sx={{
                    py: 1.35,
                    px: 3,
                    fontWeight: 700,
                    borderColor: "divider",
                    bgcolor: (theme) =>
                      alpha(theme.palette.background.paper, 0.6),
                    backdropFilter: "blur(8px)",
                    transition:
                      "transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: "primary.main",
                      bgcolor: (theme) =>
                        alpha(theme.palette.background.paper, 0.95),
                    },
                  }}
                >
                  Explore Mentors
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
