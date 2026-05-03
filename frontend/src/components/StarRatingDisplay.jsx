import { Rating, Stack, Typography } from '@mui/material'

/** Read-only star display for 1–5 ratings. */
export default function StarRatingDisplay({ value, label, size = 'small' }) {
  const num = Number(value) || 0
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" component="span">
      <Rating value={num} readOnly precision={0.1} size={size} sx={{ color: 'primary.main' }} />
      {label ? (
        <Typography variant="caption" color="text.secondary" component="span">
          {label}
        </Typography>
      ) : null}
    </Stack>
  )
}
