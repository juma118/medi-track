'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card, CardContent, Box, Typography, Chip, Stack, Button, TextField, MenuItem, Alert,
} from '@mui/material'
import { useTodayAppointments, useCreateAppointment, useDoctors, usePatients } from '@/lib/hooks'
import { useAuth, isReceptionist } from '@/lib/auth'
import { PageHeader, Loading, statusColor } from '@/components/ui'
import { StatusName } from '@/lib/types'

export default function AppointmentsPage() {
  const today = useTodayAppointments()
  const role = useAuth((s) => s.role)
  const router = useRouter()

  return (
    <Box>
      <PageHeader title="Appointments" subtitle="Today's schedule and booking" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Today</Typography>
            {today.isLoading ? <Loading /> : today.data && today.data.length ? (
              <Stack spacing={1.5}>
                {today.data.map((a) => (
                  <Box key={a.id} onClick={() => router.push(`/appointments/${a.id}`)}
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid', borderColor: 'divider', p: 1.5, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{a.patientName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Dr. {a.doctorName}{a.reason ? ` · ${a.reason}` : ''}
                      </Typography>
                    </Box>
                    <Chip size="small" color={statusColor[a.status]} label={StatusName[a.status]} />
                  </Box>
                ))}
              </Stack>
            ) : <Typography variant="body2" color="text.secondary">No appointments scheduled today.</Typography>}
          </CardContent>
        </Card>

        {isReceptionist(role) ? <BookingForm /> : (
          <Card><CardContent><Typography variant="body2" color="text.secondary">Only receptionists can book appointments.</Typography></CardContent></Card>
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
      <CardContent component="form" onSubmit={(e: React.FormEvent) => {
        e.preventDefault()
        create.mutate({ ...form, scheduledAt: new Date(form.scheduledAt).toISOString() }, { onSuccess: () => setForm({ patientId: '', doctorId: '', scheduledAt: '', reason: '' }) })
      }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Book appointment</Typography>
        <Stack spacing={2}>
          <TextField select label="Patient" value={form.patientId} onChange={(e) => set('patientId', e.target.value)} required>
            {patients.data?.items.map((p) => <MenuItem key={p.id} value={p.id}>{p.fullName}</MenuItem>)}
          </TextField>
          <TextField select label="Doctor" value={form.doctorId} onChange={(e) => set('doctorId', e.target.value)} required>
            {doctors.data?.map((d) => <MenuItem key={d.id} value={d.id}>{d.fullName} — {d.specialty}</MenuItem>)}
          </TextField>
          <TextField type="datetime-local" label="When" slotProps={{ inputLabel: { shrink: true } }} value={form.scheduledAt} onChange={(e) => set('scheduledAt', e.target.value)} required />
          <TextField label="Reason" value={form.reason} onChange={(e) => set('reason', e.target.value)} />
          <Button type="submit" variant="contained" disabled={create.isPending}>{create.isPending ? 'Booking…' : 'Book'}</Button>
          {create.isError && <Alert severity="error">Could not book. Pick a future time.</Alert>}
          {create.isSuccess && <Alert severity="success">Appointment booked.</Alert>}
        </Stack>
      </CardContent>
    </Card>
  )
}
