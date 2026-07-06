'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  MenuItem,
} from '@mui/material'
import {
  usePatients,
  usePatientPrescriptions,
  usePatientAppointments,
  useCreatePrescription,
} from '@/lib/hooks'
import { PageHeader, Loading } from '@/components/ui'

export default function PrescriptionsPage() {
  const patients = usePatients('', 1)
  const [patientId, setPatientId] = useState('')
  const meds = usePatientPrescriptions(patientId)
  const appts = usePatientAppointments(patientId)
  const create = useCreatePrescription()
  const [f, setF] = useState({ medication: '', dosage: '', frequency: '', expiryDate: '' })
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }))
  const appointmentId = appts.data?.[0]?.id

  return (
    <Box>
      <PageHeader title="Prescriptions" subtitle="Active medications tracker" />
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            select
            label="Patient"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            sx={{ minWidth: 280 }}
          >
            {patients.data?.items.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.fullName}
              </MenuItem>
            ))}
          </TextField>
        </CardContent>
      </Card>

      {patientId && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Active medications
              </Typography>
              {meds.isLoading ? (
                <Loading />
              ) : meds.data && meds.data.length ? (
                <Stack spacing={1}>
                  {meds.data.map((m) => (
                    <Box key={m.id} sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 2 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                        {m.medication} · {m.dosage}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {m.frequency}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No active prescriptions.
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Add prescription
              </Typography>
              {appointmentId ? (
                <Box
                  component="form"
                  onSubmit={(e: React.FormEvent) => {
                    e.preventDefault()
                    create.mutate(
                      { appointmentId, ...f, expiryDate: f.expiryDate || undefined },
                      {
                        onSuccess: () =>
                          setF({ medication: '', dosage: '', frequency: '', expiryDate: '' }),
                      },
                    )
                  }}
                >
                  <Stack spacing={1.5}>
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
                    <TextField
                      size="small"
                      type="date"
                      label="Expiry"
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={f.expiryDate}
                      onChange={(e) => set('expiryDate', e.target.value)}
                    />
                    <Button type="submit" variant="contained" disabled={create.isPending}>
                      Add prescription
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      Linked to the patient&apos;s most recent appointment.
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  This patient has no appointment to attach a prescription to.
                </Typography>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </Box>
  )
}
