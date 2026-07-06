'use client'

import { useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  AppBar,
  Box,
  Drawer,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Divider,
  Tooltip,
  Chip,
} from '@mui/material'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded'
import { useAuth } from '@/lib/auth'
import { RoleName } from '@/lib/types'

export interface NavItem {
  href: string
  label: string
  icon: ReactNode
}
const DRAWER_WIDTH = 248

export default function AppShell({
  items,
  brand,
  children,
}: {
  items: NavItem[]
  brand: string
  children: ReactNode
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { fullName, role, logout } = useAuth()

  const isActive = (href: string) =>
    href === '/dashboard' || href === '/portal' ? pathname === href : pathname.startsWith(href)

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34 }}>
          <LocalHospitalRoundedIcon fontSize="small" />
        </Avatar>
        <Box>
          <Typography sx={{ fontWeight: 800, lineHeight: 1 }}>MediTrack</Typography>
          <Typography variant="caption" color="text.secondary">
            {brand}
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {items.map((it) => {
          const active = isActive(it.href)
          return (
            <ListItemButton
              key={it.href}
              selected={active}
              onClick={() => {
                router.push(it.href)
                setMobileOpen(false)
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                },
                '&.Mui-selected .MuiListItemIcon-root': { color: 'primary.contrastText' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: active ? 'inherit' : 'text.secondary' }}>
                {it.icon}
              </ListItemIcon>
              <ListItemText slotProps={{ primary: { sx: { fontWeight: 600, fontSize: 14 } } }}>
                {it.label}
              </ListItemText>
            </ListItemButton>
          )
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
          {fullName?.[0] ?? '?'}
        </Avatar>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography noWrap sx={{ fontWeight: 600, fontSize: 14 }}>
            {fullName}
          </Typography>
          <Chip size="small" label={role ? RoleName[role] : ''} sx={{ height: 18, fontSize: 11 }} />
        </Box>
        <Tooltip title="Sign out">
          <IconButton
            onClick={() => {
              logout()
              router.replace('/login')
            }}
          >
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        sx={{
          display: { md: 'none' },
          background: 'linear-gradient(90deg, #0f766e, #0d9488)',
          color: 'white',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 1, color: 'white' }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 800 }}>MediTrack</Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              borderRight: '1px solid rgba(15,23,42,0.08)',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: { xs: 7, md: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
