'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  Box,
  Button,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Stack,
  Typography,
  Collapse,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import { usePatients, useCreatePatient } from '@/lib/hooks'
import { useAuth, isReceptionist } from '@/lib/auth'
import { PageHeader, Loading } from '@/components/ui'

const bloodTypes = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [blood, setBlood] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const { data, isLoading } = usePatients(search, page, blood)
  const role = useAuth((s) => s.role)
  const router = useRouter()

  return (
    <Box>
      <PageHeader
        title="Patients"
        subtitle="Search and manage patient records"
        action={
          isReceptionist(role) && (
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setShowForm((v) => !v)}
            >
              New patient
            </Button>
          )
        }
      />

      <Collapse in={showForm}>
        <NewPatientForm onDone={() => setShowForm(false)} />
      </Collapse>

      <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: 'wrap' }} useFlexGap>
        <TextField
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          sx={{ minWidth: 280, flexGrow: 1 }}
        />
        <TextField
          select
          label="Blood type"
          value={blood}
          onChange={(e) => {
            setBlood(e.target.value)
            setPage(1)
          }}
          sx={{ minWidth: 160 }}
        >
          {bloodTypes.map((b) => (
            <MenuItem key={b} value={b}>
              {b || 'All blood types'}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Card>
        {isLoading ? (
          <Loading />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>DOB</TableCell>
                <TableCell>Blood</TableCell>
                <TableCell>Contact</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.items.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => router.push(`/patients/${p.id}`)}
                >
                  <TableCell sx={{ fontWeight: 600 }}>{p.fullName}</TableCell>
                  <TableCell>{new Date(p.dateOfBirth).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {p.bloodType && (
                      <Chip size="small" color="error" variant="outlined" label={p.bloodType} />
                    )}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {p.email ?? p.phone ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
              {data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    No patients found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {data && data.totalPages > 1 && (
        <Stack direction="row" spacing={2} sx={{ mt: 2, alignItems: 'center' }}>
          <Button variant="outlined" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <Typography variant="body2" color="text.secondary">
            Page {data.page} of {data.totalPages}
          </Typography>
          <Button
            variant="outlined"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </Stack>
      )}
    </Box>
  )
}

function NewPatientForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({
    fullName: '',
    dateOfBirth: '',
    bloodType: '',
    phone: '',
    email: '',
  })
  const create = useCreatePatient()
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent
        component="form"
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault()
          create.mutate(form, { onSuccess: onDone })
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <TextField
            label="Full name"
            value={form.fullName}
            onChange={(e) => set('fullName', e.target.value)}
            required
          />
          <TextField
            label="Date of birth"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            value={form.dateOfBirth}
            onChange={(e) => set('dateOfBirth', e.target.value)}
            required
          />
          <TextField
            label="Blood type"
            value={form.bloodType}
            onChange={(e) => set('bloodType', e.target.value)}
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Button type="submit" variant="contained" disabled={create.isPending}>
              Save
            </Button>
            <Button onClick={onDone}>Cancel</Button>
          </Stack>
        </div>
        {create.isError && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            Could not create patient. Check the fields.
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
