'use client'

import { useState } from 'react'
import { Card, CardContent, Box, Typography, Chip, Stack, Button, TextField, MenuItem, Alert } from '@mui/material'
import { useMyAppointments, usePortalDoctors, useSelfBook } from '@/lib/portalHooks'
import { PageHeader, Loading, statusColor } from '@/components/ui'
import { StatusName } from '@/lib/types'

export default function PortalAppointments() {
  const appts = useMyAppointments()
  const doctors = usePortalDoctors()
  const book = useSelfBook()
  const [form, setForm] = useState({ doctorId: '', scheduledAt: '', reason: '' })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <Box>
      <PageHeader title="My Appointments" subtitle="View upcoming visits and book a new one" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Your appointments</Typography>
            {appts.isLoading ? <Loading /> : appts.data && appts.data.length ? (
              <Stack spacing={1.5}>
                {appts.data.map((a) => (
                  <Box key={a.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid', borderColor: 'divider', p: 1.5, borderRadius: 2 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{new Date(a.scheduledAt).toLocaleString()}</Typography>
                      <Typography variant="caption" color="text.secondary">Dr. {a.doctorName} · {a.reason ?? 'General'}</Typography>
                    </Box>
                    <Chip size="small" color={statusColor[a.status]} label={StatusName[a.status]} />
                  </Box>
                ))}
              </Stack>
            ) : <Typography variant="body2" color="text.secondary">No appointments yet.</Typography>}
          </CardContent>
        </Card>

        <Card>
          <CardContent component="form" onSubmit={(e: React.FormEvent) => {
            e.preventDefault()
            book.mutate({ ...form, scheduledAt: new Date(form.scheduledAt).toISOString() }, { onSuccess: () => setForm({ doctorId: '', scheduledAt: '', reason: '' }) })
          }}>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Book an appointment</Typography>
            <Stack spacing={2}>
              <TextField select label="Doctor" value={form.doctorId} onChange={(e) => set('doctorId', e.target.value)} required>
                {doctors.data?.map((d) => <MenuItem key={d.id} value={d.id}>{d.fullName} — {d.specialty}</MenuItem>)}
              </TextField>
              <TextField type="datetime-local" label="When" slotProps={{ inputLabel: { shrink: true } }} value={form.scheduledAt} onChange={(e) => set('scheduledAt', e.target.value)} required />
              <TextField label="Reason for visit" value={form.reason} onChange={(e) => set('reason', e.target.value)} />
              <Button type="submit" variant="contained" disabled={book.isPending}>{book.isPending ? 'Booking…' : 'Request appointment'}</Button>
              {book.isError && <Alert severity="error">Could not book — pick a future time.</Alert>}
              {book.isSuccess && <Alert severity="success">Appointment booked!</Alert>}
            </Stack>
          </CardContent>
        </Card>
      </div>
    </Box>
  )
}
