import { Stack, Typography } from '@mui/material'

/**
 * Consistent page title row: hierarchy, optional actions, responsive wrap.
 */
export default function PageHeader({ title, subtitle, action = null, component: Root = 'header' }) {
  return (
    <Stack
      component={Root}
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{
        mb: 2,
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        gap: 1.5,
      }}
    >
      <Stack spacing={0.5} sx={{ minWidth: 0, flex: action ? 1 : undefined }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Stack>
      {action ? <Stack sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>{action}</Stack> : null}
    </Stack>
  )
}
