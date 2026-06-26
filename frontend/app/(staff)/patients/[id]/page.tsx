'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import {
  Card, CardContent, Box, Typography, Chip, Stack, Button, TextField, Divider, Alert, Link as MuiLink,
} from '@mui/material'
import {
  usePatient, usePatientAppointments, usePatientPrescriptions, usePatientRecords,
  useUploadRecord, useCreatePrescription, useSetDiagnosis, useSetStatus, openRecordFile,
} from '@/lib/hooks'
import { usePatientThread, useReplyToPatient, useCreatePatientAccount } from '@/lib/portalHooks'
import { useAuth, isDoctor, isReceptionist } from '@/lib/auth'
import { PageHeader, Loading, statusColor, summaryColor } from '@/components/ui'
import { Thread } from '@/components/Thread'
import { StatusName, SummaryStatusName, type AppointmentStatus } from '@/lib/types'
import { subscribeToPatient } from '@/lib/signalr'

const statusActions: { status: AppointmentStatus; label: string }[] = [
  { status: 2, label: 'Check in' }, { status: 3, label: 'Complete' }, { status: 4, label: 'Cancel' }, { status: 5, label: 'No show' },
]

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const patient = usePatient(id)
  const appts = usePatientAppointments(id)
  const meds = usePatientPrescriptions(id)
  const records = usePatientRecords(id)
  const role = useAuth((s) => s.role)
  const qc = useQueryClient()

  useEffect(() => {
    if (!id) return
    subscribeToPatient(id, () => qc.invalidateQueries({ queryKey: ['records', id] })).catch(() => {})
  }, [id, qc])

  if (patient.isLoading || !patient.data) return <Loading />
  const p = patient.data

  return (
    <Box>
      <PageHeader title={p.fullName} subtitle={`DOB ${new Date(p.dateOfBirth).toLocaleDateString()} · ${p.bloodType ?? 'Unknown blood type'}`} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Profile</Typography>
            <Row k="Email" v={p.email} /><Row k="Phone" v={p.phone} />
            <Row k="Blood type" v={p.bloodType} /><Row k="History" v={p.medicalHistory} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Appointments</Typography>
            {appts.isLoading ? <Loading /> : appts.data && appts.data.length ? (
              <Stack spacing={1.5}>{appts.data.map((a) => <AppointmentRow key={a.id} a={a} doctor={isDoctor(role)} />)}</Stack>
            ) : <Typography variant="body2" color="text.secondary">No appointments.</Typography>}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Active prescriptions</Typography>
            {meds.isLoading ? <Loading /> : meds.data && meds.data.length ? (
              <Stack spacing={1}>
                {meds.data.map((m) => (
                  <Box key={m.id} sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{m.medication} · {m.dosage}</Typography>
                    <Typography variant="caption" color="text.secondary">{m.frequency}{m.expiryDate ? ` · exp ${new Date(m.expiryDate).toLocaleDateString()}` : ''}</Typography>
                  </Box>
                ))}
              </Stack>
            ) : <Typography variant="body2" color="text.secondary">No active prescriptions.</Typography>}
            {isDoctor(role) && appts.data && appts.data.length > 0 && <PrescriptionForm appointmentId={appts.data[0].id} />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>Medical records &amp; AI summaries</Typography>
            {isDoctor(role) && <UploadRecord patientId={id} />}
            {records.isLoading ? <Loading /> : records.data && records.data.length ? (
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {records.data.map((r) => (
                  <Box key={r.id} sx={{ border: '1px solid', borderColor: 'divider', p: 1.5, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <MuiLink component="button" onClick={() => openRecordFile(r.id)} sx={{ fontWeight: 600 }}>📄 {r.fileName}</MuiLink>
                      <Chip size="small" color={summaryColor[r.summaryStatus]} label={SummaryStatusName[r.summaryStatus]} />
                    </Box>
                    {r.aiSummary && <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line' }}>{r.aiSummary}</Typography>}
                  </Box>
                ))}
              </Stack>
            ) : <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No records uploaded.</Typography>}
          </CardContent>
        </Card>

        <MessagingPanel patientId={id} />
        {isReceptionist(role) && <AccountPanel patientId={id} />}
      </div>
    </Box>
  )
}

function Row({ k, v }: { k: string; v?: string | null }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">{k}</Typography>
      <Typography variant="body2" sx={{ textAlign: 'right' }}>{v || '—'}</Typography>
    </Box>
  )
}

function AppointmentRow({ a, doctor }: { a: import('@/lib/types').Appointment; doctor: boolean }) {
  const setStatus = useSetStatus()
  const setDiagnosis = useSetDiagnosis()
  const [diag, setDiag] = useState(a.diagnosis ?? '')
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', p: 1.5, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{new Date(a.scheduledAt).toLocaleString()}</Typography>
        <Chip size="small" color={statusColor[a.status]} label={StatusName[a.status]} />
      </Box>
      <Typography variant="body2" color="text.secondary">Dr. {a.doctorName} · {a.reason ?? 'No reason'}</Typography>
      {a.diagnosis && <Typography variant="body2" sx={{ mt: 0.5 }}>Diagnosis: {a.diagnosis}</Typography>}
      <Stack direction="row" spacing={0.5} sx={{ mt: 1, flexWrap: 'wrap' }} useFlexGap>
        {statusActions.filter((s) => s.status !== a.status).map((s) => (
          <Button key={s.status} size="small" variant="outlined" onClick={() => setStatus.mutate({ id: a.id, status: s.status })}>{s.label}</Button>
        ))}
      </Stack>
      {doctor && (
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <TextField size="small" fullWidth placeholder="Diagnosis" value={diag} onChange={(e) => setDiag(e.target.value)} />
          <Button variant="outlined" onClick={() => setDiagnosis.mutate({ id: a.id, diagnosis: diag })}>Save</Button>
        </Stack>
      )}
    </Box>
  )
}

function PrescriptionForm({ appointmentId }: { appointmentId: string }) {
  const [f, setF] = useState({ medication: '', dosage: '', frequency: '' })
  const create = useCreatePrescription()
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }))
  return (
    <Box component="form" sx={{ mt: 2 }} onSubmit={(e: React.FormEvent) => { e.preventDefault(); create.mutate({ appointmentId, ...f }, { onSuccess: () => setF({ medication: '', dosage: '', frequency: '' }) }) }}>
      <Stack spacing={1}>
        <TextField size="small" label="Medication" value={f.medication} onChange={(e) => set('medication', e.target.value)} required />
        <Stack direction="row" spacing={1}>
          <TextField size="small" label="Dosage" value={f.dosage} onChange={(e) => set('dosage', e.target.value)} required />
          <TextField size="small" label="Frequency" value={f.frequency} onChange={(e) => set('frequency', e.target.value)} required />
        </Stack>
        <Button type="submit" variant="contained" disabled={create.isPending}>Add prescription</Button>
      </Stack>
    </Box>
  )
}

function UploadRecord({ patientId }: { patientId: string }) {
  const upload = useUploadRecord()
  const fileRef = useRef<HTMLInputElement>(null)
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <input ref={fileRef} type="file" style={{ fontSize: 14 }} />
      <Button variant="outlined" disabled={upload.isPending} onClick={() => {
        const file = fileRef.current?.files?.[0]
        if (file) upload.mutate({ patientId, recordType: 1, file }, { onSuccess: () => { if (fileRef.current) fileRef.current.value = '' } })
      }}>{upload.isPending ? 'Uploading…' : 'Upload & summarize'}</Button>
    </Stack>
  )
}

function MessagingPanel({ patientId }: { patientId: string }) {
  const thread = usePatientThread(patientId)
  const reply = useReplyToPatient(patientId)
  const [text, setText] = useState('')
  const send = () => { if (text.trim()) { reply.mutate({ body: text }); setText('') } }
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1.5 }}>💬 Messages</Typography>
        {thread.isLoading ? <Loading /> : <Thread messages={thread.data ?? []} mineIsPatient={false} />}
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <TextField size="small" fullWidth placeholder="Reply to patient…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
          <Button variant="contained" onClick={send} disabled={reply.isPending || !text.trim()}>Send</Button>
        </Stack>
      </CardContent>
    </Card>
  )
}

function AccountPanel({ patientId }: { patientId: string }) {
  const create = useCreatePatientAccount(patientId)
  const [form, setForm] = useState({ email: '', password: '' })
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1.5 }}>🔑 Portal account</Typography>
        {create.isSuccess ? <Alert severity="success">Portal account created. The patient can now sign in.</Alert> : (
          <Box component="form" onSubmit={(e: React.FormEvent) => { e.preventDefault(); create.mutate(form) }}>
            <Stack spacing={1.5}>
              <Typography variant="body2" color="text.secondary">Create a patient-portal login.</Typography>
              <TextField size="small" label="Login email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
              <TextField size="small" label="Temporary password (min 8)" value={form.password} onChange={(e) => set('password', e.target.value)} required />
              <Button type="submit" variant="contained" disabled={create.isPending}>Create account</Button>
              {create.isError && <Alert severity="error">Could not create — email may be in use or an account already exists.</Alert>}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
