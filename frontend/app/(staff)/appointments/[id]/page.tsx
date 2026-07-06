'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, Box, Typography, Chip, Stack, Button, TextField } from '@mui/material'
import {
  useAppointment,
  useSetDiagnosis,
  useSetStatus,
  useCreatePrescription,
  usePatientPrescriptions,
} from '@/lib/hooks'
import { useAuth, isDoctor } from '@/lib/auth'
import { PageHeader, Loading, statusColor } from '@/components/ui'
import { StatusName, type AppointmentStatus } from '@/lib/types'

const statusActions: { status: AppointmentStatus; label: string }[] = [
  { status: 2, label: 'Check in' },
  { status: 3, label: 'Complete' },
  { status: 4, label: 'Cancel' },
  { status: 5, label: 'No show' },
]

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const appt = useAppointment(id)
  const role = useAuth((s) => s.role)
  const router = useRouter()
  const setStatus = useSetStatus()
  const setDiagnosis = useSetDiagnosis()
  const [diag, setDiag] = useState('')

  if (appt.isLoading || !appt.data) return <Loading />
  const a = appt.data
  const doctor = isDoctor(role)

  return (
    <Box>
      <PageHeader title="Appointment" subtitle={new Date(a.scheduledAt).toLocaleString()} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}
            >
              <MuiPatientLink
                name={a.patientName}
                onClick={() => router.push(`/patients/${a.patientId}`)}
              />
              <Chip size="small" color={statusColor[a.status]} label={StatusName[a.status]} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              Dr. {a.doctorName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Reason: {a.reason ?? '—'}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 1.5, flexWrap: 'wrap' }} useFlexGap>
              {statusActions
                .filter((s) => s.status !== a.status)
                .map((s) => (
                  <Button
                    key={s.status}
                    size="small"
                    variant="outlined"
                    onClick={() => setStatus.mutate({ id: a.id, status: s.status })}
                  >
                    {s.label}
                  </Button>
                ))}
            </Stack>
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Diagnosis
              </Typography>
              <Typography variant="body2">{a.diagnosis ?? 'Not recorded'}</Typography>
              {doctor && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Record diagnosis"
                    value={diag}
                    onChange={(e) => setDiag(e.target.value)}
                  />
                  <Button
                    variant="outlined"
                    onClick={() => setDiagnosis.mutate({ id: a.id, diagnosis: diag })}
                  >
                    Save
                  </Button>
                </Stack>
              )}
            </Box>
          </CardContent>
        </Card>

        {doctor && <AppointmentPrescriptions appointmentId={a.id} patientId={a.patientId} />}
      </div>
    </Box>
  )
}

function MuiPatientLink({ name, onClick }: { name: string; onClick: () => void }) {
  return (
    <Typography
      onClick={onClick}
      sx={{
        fontWeight: 700,
        color: 'primary.main',
        cursor: 'pointer',
        '&:hover': { textDecoration: 'underline' },
      }}
    >
      {name}
    </Typography>
  )
}

function AppointmentPrescriptions({
  appointmentId,
  patientId,
}: {
  appointmentId: string
  patientId: string
}) {
  const meds = usePatientPrescriptions(patientId)
  const create = useCreatePrescription()
  const [f, setF] = useState({ medication: '', dosage: '', frequency: '' })
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }))
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          Prescriptions
        </Typography>
        {meds.data && meds.data.length > 0 && (
          <Stack spacing={1} sx={{ mb: 1.5 }}>
            {meds.data.map((m) => (
              <Box key={m.id} sx={{ bgcolor: 'grey.50', p: 1, borderRadius: 2, fontSize: 14 }}>
                {m.medication} · {m.dosage} · {m.frequency}
              </Box>
            ))}
          </Stack>
        )}
        <Box
          component="form"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault()
            create.mutate(
              { appointmentId, ...f },
              { onSuccess: () => setF({ medication: '', dosage: '', frequency: '' }) },
            )
          }}
        >
          <Stack spacing={1}>
            <TextField
              size="small"
              label="Medication"
              value={f.medication}
              onChange={(e) => set('medication', e.target.value)}
              required
            />
            <Stack direction="row" spacing={1}>
              <TextField
                size="small"
                label="Dosage"
                value={f.dosage}
                onChange={(e) => set('dosage', e.target.value)}
                required
              />
              <TextField
                size="small"
                label="Frequency"
                value={f.frequency}
                onChange={(e) => set('frequency', e.target.value)}
                required
              />
            </Stack>
            <Button type="submit" variant="contained" disabled={create.isPending}>
              Add prescription
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}
