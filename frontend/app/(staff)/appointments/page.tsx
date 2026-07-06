'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Stack,
  Button,
  TextField,
  MenuItem,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { useAppointments, useCreateAppointment, useDoctors, usePatients } from '@/lib/hooks'
import { useAuth, isReceptionist } from '@/lib/auth'
import { PageHeader, Loading, statusColor } from '@/components/ui'
import { StatusName } from '@/lib/types'

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function rangeFor(key: string): { from: string; to: string } {
  const now = new Date()
  if (key === 'week') {
    const end = new Date(now)
    end.setDate(now.getDate() + 6)
    return { from: iso(now), to: iso(end) }
  }
  if (key === 'month') {
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return { from: iso(first), to: iso(last) }
  }
  return { from: iso(now), to: iso(now) } // today
}

export default function AppointmentsPage() {
  const role = useAuth((s) => s.role)
  const router = useRouter()
  const [preset, setPreset] = useState('today')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  // Default to today on the client (avoids SSR/client date mismatch).
  useEffect(() => {
    const r = rangeFor('today')
    setFrom(r.from)
    setTo(r.to)
  }, [])

  const appts = useAppointments(from, to)

  const selectPreset = (key: string) => {
    setPreset(key)
    if (key !== 'custom') {
      const r = rangeFor(key)
      setFrom(r.from)
      setTo(r.to)
    }
  }

  const heading =
    from && to && from === to
      ? new Date(`${from}T00:00:00`).toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      : from && to
        ? `${new Date(`${from}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${new Date(`${to}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
        : 'Schedule'
  const multiDay = from !== to

  return (
    <Box>
      <PageHeader title="Appointments" subtitle="Schedule and booking" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ mb: 2, flexWrap: 'wrap', alignItems: 'center' }}
              useFlexGap
            >
              <ToggleButtonGroup
                size="small"
                exclusive
                value={preset}
                onChange={(_, v) => v && selectPreset(v)}
              >
                <ToggleButton value="today">Today</ToggleButton>
                <ToggleButton value="week">Next 7 days</ToggleButton>
                <ToggleButton value="month">This month</ToggleButton>
                <ToggleButton value="custom">Custom</ToggleButton>
              </ToggleButtonGroup>
              <TextField
                type="date"
                size="small"
                label="From"
                slotProps={{ inputLabel: { shrink: true } }}
                value={from}
                onChange={(e) => {
                  setPreset('custom')
                  setFrom(e.target.value)
                }}
                sx={{ width: 165 }}
              />
              <TextField
                type="date"
                size="small"
                label="To"
                slotProps={{ inputLabel: { shrink: true } }}
                value={to}
                onChange={(e) => {
                  setPreset('custom')
                  setTo(e.target.value)
                }}
                sx={{ width: 165 }}
              />
            </Stack>

            <Typography variant="h6" sx={{ mb: 2 }}>
              {heading}
            </Typography>
            {appts.isLoading ? (
              <Loading />
            ) : appts.data && appts.data.length ? (
              <Stack spacing={1.5}>
                {appts.data.map((a) => (
                  <Box
                    key={a.id}
                    onClick={() => router.push(`/appointments/${a.id}`)}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      p: 1.5,
                      borderRadius: 2,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                        {a.patientName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(a.scheduledAt).toLocaleString([], {
                          ...(multiDay ? { month: 'short', day: 'numeric' } : {}),
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · Dr. {a.doctorName}
                        {a.reason ? ` · ${a.reason}` : ''}
                      </Typography>
                    </Box>
                    <Chip size="small" color={statusColor[a.status]} label={StatusName[a.status]} />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No appointments scheduled in this period.
              </Typography>
            )}
          </CardContent>
        </Card>

        {isReceptionist(role) ? (
          <BookingForm />
        ) : (
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Only receptionists can book appointments.
              </Typography>
            </CardContent>
          </Card>
        )}
      </div>
    </Box>
  )
}

function BookingForm() {
  const patients = usePatients('', 1)
  const doctors = useDoctors()
  const create = useCreateAppointment()
  const [form, setForm] = useState({ patientId: '', doctorId: '', scheduledAt: '', reason: '' })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <Card>
      <CardContent
        component="form"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault()
          create.mutate(
            { ...form, scheduledAt: new Date(form.scheduledAt).toISOString() },
            {
              onSuccess: () =>
                setForm({ patientId: '', doctorId: '', scheduledAt: '', reason: '' }),
            },
          )
        }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          Book appointment
        </Typography>
        <Stack spacing={2}>
          <TextField
            select
            label="Patient"
            value={form.patientId}
            onChange={(e) => set('patientId', e.target.value)}
            required
          >
            {patients.data?.items.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.fullName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Doctor"
            value={form.doctorId}
            onChange={(e) => set('doctorId', e.target.value)}
            required
          >
            {doctors.data?.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.fullName} — {d.specialty}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="datetime-local"
            label="When"
            slotProps={{ inputLabel: { shrink: true } }}
            value={form.scheduledAt}
            onChange={(e) => set('scheduledAt', e.target.value)}
            required
          />
          <TextField
            label="Reason"
            value={form.reason}
            onChange={(e) => set('reason', e.target.value)}
          />
          <Button type="submit" variant="contained" disabled={create.isPending}>
            {create.isPending ? 'Booking…' : 'Book'}
          </Button>
          {create.isError && <Alert severity="error">Could not book. Pick a future time.</Alert>}
          {create.isSuccess && <Alert severity="success">Appointment booked.</Alert>}
        </Stack>
      </CardContent>
    </Card>
  )
}
