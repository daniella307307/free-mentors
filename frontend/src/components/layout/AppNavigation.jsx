import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'

export default function AppNavigation({ items, pathname, onNavigate }) {
  return (
    <List disablePadding sx={{ px: 0.5 }}>
      {items.map((item) => {
        const selected =
          pathname === item.path || (item.path === '/mentors' && pathname.startsWith('/mentors/'))
        return (
          <ListItemButton
            key={item.key}
            selected={selected}
            onClick={() => onNavigate(item.path)}
            sx={{
              mb: 0.5,
              borderRadius: 2,
              py: 1.1,
              transition: 'background-color 0.2s ease, transform 0.15s ease',
              '&:hover': {
                transform: 'translateX(2px)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { sx: { fontWeight: 700, fontSize: '0.9375rem' } } }}
            />
          </ListItemButton>
        )
      })}
    </List>
  )
}
