import { CircularProgress, Stack, Typography } from '@mui/material'

export default function LoadingState({ label = 'Loading...', compact = false }) {
  return (
    <Stack
      spacing={1.25}
      sx={{
        py: compact ? 1.5 : 4,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress size={compact ? 24 : 34} thickness={4.2} />
      <Typography variant={compact ? 'body2' : 'body1'} color="text.secondary">
        {label}
      </Typography>
    </Stack>
  )
}
