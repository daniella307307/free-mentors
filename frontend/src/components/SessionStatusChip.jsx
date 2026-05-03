import { Chip } from '@mui/material'
import { SESSION_STATUS_CHIP_COLOR } from '../constants/sessionStatus'

export default function SessionStatusChip({ status, size = 'small', sx = {} }) {
  return (
    <Chip
      label={status}
      color={SESSION_STATUS_CHIP_COLOR[status] || 'default'}
      size={size}
      sx={{ textTransform: 'capitalize', ...sx }}
    />
  )
}
