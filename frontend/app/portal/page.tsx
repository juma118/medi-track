'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, Box, Typography, Chip, Stack, Button, Avatar } from '@mui/material'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import ChatRoundedIcon from '@mui/icons-material/ChatRounded'
import { useMyProfile, useMyAppointments, useMyPrescriptions } from '@/lib/portalHooks'
import { PageHeader, Loading, statusColor } from '@/components/ui'
import { StatusName } from '@/lib/types'

export default function PortalHome() {
  const me = useMyProfile()
  const appts = useMyAppointments()
  const meds = useMyPrescriptions()
  const router = useRouter()

  if (me.isLoading || !me.data) return <Loading />

  const upcoming = appts.data
    ?.filter((a) => new Date(a.scheduledAt) >= new Date() && (a.status === 1 || a.status === 2))
    .sort((x, y) => +new Date(x.scheduledAt) - +new Date(y.scheduledAt))[0]

  return (
    <Box>
      <PageHeader
        title={`Welcome, ${me.data.fullName.split(' ')[0]}`}
        subtitle="Your health at a glance"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Next appointment
            </Typography>
            {upcoming ? (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">
                    {new Date(upcoming.scheduledAt).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dr. {upcoming.doctorName} · {upcoming.reason ?? 'General'}
                  </Typography>
                </Box>
                <Chip color={statusColor[upcoming.status]} label={StatusName[upcoming.status]} />
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No upcoming appointments.{' '}
                <Button size="small" onClick={() => router.push('/portal/appointments')}>
                  Book one
                </Button>
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Active medications
            </Typography>
            <Typography variant="h3">{meds.data?.length ?? 0}</Typography>
            <Button
              size="small"
              sx={{ mt: 1 }}
              onClick={() => router.push('/portal/prescriptions')}
            >
              View & request refills
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <QuickLink
          icon={<EventRoundedIcon />}
          label="Book appointment"
          onClick={() => router.push('/portal/appointments')}
        />
        <QuickLink
          icon={<DescriptionRoundedIcon />}
          label="View my records"
          onClick={() => router.push('/portal/records')}
        />
        <QuickLink
          icon={<ChatRoundedIcon />}
          label="Message my clinic"
          onClick={() => router.push('/portal/messages')}
        />
      </div>
    </Box>
  )
}

function QuickLink({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <Card
      sx={{
        cursor: 'pointer',
        transition: '0.15s',
        '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ textAlign: 'center' }}>
        <Avatar
          variant="rounded"
          sx={{ bgcolor: 'primary.light', color: 'primary.dark', mx: 'auto', mb: 1 }}
        >
          {icon}
        </Avatar>
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{label}</Typography>
      </CardContent>
    </Card>
  )
}
