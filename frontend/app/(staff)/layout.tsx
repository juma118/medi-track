'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded'
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded'
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded'
import { useAuth, isPatient, isDoctor } from '@/lib/auth'
import AppShell, { type NavItem } from '@/components/AppShell'
import { Loading } from '@/components/ui'

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { accessToken, role, hydrated } = useAuth()

  useEffect(() => {
    if (!hydrated) return
    if (!accessToken) router.replace('/login')
    else if (isPatient(role)) router.replace('/portal')
  }, [hydrated, accessToken, role, router])

  if (!hydrated || !accessToken || isPatient(role)) return <Loading />

  const doctor = isDoctor(role)
  const items: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: <SpaceDashboardRoundedIcon /> },
    { href: '/patients', label: 'Patients', icon: <PeopleAltRoundedIcon /> },
    { href: '/appointments', label: 'Appointments', icon: <EventRoundedIcon /> },
    ...(doctor
      ? [
          { href: '/records', label: 'Medical Records', icon: <DescriptionRoundedIcon /> },
          { href: '/prescriptions', label: 'Prescriptions', icon: <MedicationRoundedIcon /> },
          { href: '/refill-requests', label: 'Refill Requests', icon: <AutorenewRoundedIcon /> },
          { href: '/ai', label: 'AI Assistant', icon: <SmartToyRoundedIcon /> },
        ]
      : []),
  ]

  return (
    <AppShell items={items} brand="Clinic">
      {children}
    </AppShell>
  )
}
