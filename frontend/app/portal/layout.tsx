'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import ChatRoundedIcon from '@mui/icons-material/ChatRounded'
import { useAuth, isPatient } from '@/lib/auth'
import AppShell, { type NavItem } from '@/components/AppShell'
import { Loading } from '@/components/ui'

const items: NavItem[] = [
  { href: '/portal', label: 'Home', icon: <HomeRoundedIcon /> },
  { href: '/portal/appointments', label: 'Appointments', icon: <EventRoundedIcon /> },
  { href: '/portal/prescriptions', label: 'Prescriptions', icon: <MedicationRoundedIcon /> },
  { href: '/portal/records', label: 'My Records', icon: <DescriptionRoundedIcon /> },
  { href: '/portal/messages', label: 'Messages', icon: <ChatRoundedIcon /> },
]

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { accessToken, role, hydrated } = useAuth()

  useEffect(() => {
    if (!hydrated) return
    if (!accessToken) router.replace('/login')
    else if (!isPatient(role)) router.replace('/dashboard')
  }, [hydrated, accessToken, role, router])

  if (!hydrated || !accessToken || !isPatient(role)) return <Loading />

  return (
    <AppShell items={items} brand="Patient Portal">
      {children}
    </AppShell>
  )
}
