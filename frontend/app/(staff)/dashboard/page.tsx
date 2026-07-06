'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, Typography, Box, Chip, Stack, Avatar } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded'
import MedicationRoundedIcon from '@mui/icons-material/MedicationRounded'
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded'
import { useDashboard, useTodayAppointments } from '@/lib/hooks'
import { PageHeader, Loading, statusColor } from '@/components/ui'
import { StatusName } from '@/lib/types'

const tiles = [
  {
    key: 'totalPatients',
    label: 'Total Patients',
    icon: <PeopleAltRoundedIcon />,
    color: '#0d9488',
  },
  {
    key: 'todaysAppointments',
    label: "Today's Appointments",
    icon: <EventRoundedIcon />,
    color: '#0284c7',
  },
  {
    key: 'pendingAppointments',
    label: 'Pending',
    icon: <PendingActionsRoundedIcon />,
    color: '#d97706',
  },
  {
    key: 'activePrescriptions',
    label: 'Active Prescriptions',
    icon: <MedicationRoundedIcon />,
    color: '#4f46e5',
  },
  {
    key: 'newPatientsThisMonth',
    label: 'New This Month',
    icon: <PersonAddRoundedIcon />,
    color: '#059669',
  },
] as const

export default function DashboardPage() {
  const { data, isLoading } = useDashboard()
  const today = useTodayAppointments()
  const router = useRouter()

  if (isLoading || !data) return <Loading />

  const days = data.appointmentsLast7Days.map((d) =>
    new Date(d.day).toLocaleDateString(undefined, { weekday: 'short' }),
  )
  const counts = data.appointmentsLast7Days.map((d) => d.count)

  return (
    <Box>
      <PageHeader title="Dashboard" subtitle="Clinic overview at a glance" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {tiles.map((t) => (
          <Card key={t.key}>
            <CardContent>
              <Avatar variant="rounded" sx={{ bgcolor: `${t.color}1a`, color: t.color, mb: 1.5 }}>
                {t.icon}
              </Avatar>
              <Typography variant="h4">{data[t.key]}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t.label}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Appointments — last 7 days
            </Typography>
            <BarChart
              height={280}
              xAxis={[{ data: days, scaleType: 'band' }]}
              series={[{ data: counts, color: '#0d9488', label: 'Appointments' }]}
              borderRadius={6}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Today&apos;s schedule
            </Typography>
            {today.isLoading ? (
              <Loading />
            ) : today.data && today.data.length ? (
              <Stack spacing={1.5}>
                {today.data.map((a) => (
                  <Box
                    key={a.id}
                    onClick={() => router.push(`/appointments/${a.id}`)}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      p: 1,
                      borderRadius: 2,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                        {a.patientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(a.scheduledAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {a.doctorName}
                      </Typography>
                    </Box>
                    <Chip size="small" color={statusColor[a.status]} label={StatusName[a.status]} />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No appointments today.
              </Typography>
            )}
          </CardContent>
        </Card>
      </div>
    </Box>
  )
}
