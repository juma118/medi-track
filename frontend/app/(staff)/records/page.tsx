'use client'

import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
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
  Link as MuiLink,
} from '@mui/material'
import { usePatients, usePatientRecords, useUploadRecord, openRecordFile } from '@/lib/hooks'
import { PageHeader, Loading, summaryColor } from '@/components/ui'
import { SummaryStatusName } from '@/lib/types'
import { subscribeToPatient } from '@/lib/signalr'

export default function RecordsPage() {
  const patients = usePatients('', 1)
  const [patientId, setPatientId] = useState('')
  const records = usePatientRecords(patientId)
  const upload = useUploadRecord()
  const fileRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  useEffect(() => {
    if (!patientId) return
    subscribeToPatient(patientId, () =>
      qc.invalidateQueries({ queryKey: ['records', patientId] }),
    ).catch(() => {})
  }, [patientId, qc])

  return (
    <Box>
      <PageHeader title="Medical Records" subtitle="Upload documents and view AI summaries" />
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
          {patientId && (
            <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: 'center' }}>
              <input ref={fileRef} type="file" style={{ fontSize: 14 }} />
              <Button
                variant="contained"
                disabled={upload.isPending}
                onClick={() => {
                  const file = fileRef.current?.files?.[0]
                  if (file)
                    upload.mutate(
                      { patientId, recordType: 1, file },
                      {
                        onSuccess: () => {
                          if (fileRef.current) fileRef.current.value = ''
                        },
                      },
                    )
                }}
              >
                {upload.isPending ? 'Uploading…' : 'Upload & summarize'}
              </Button>
            </Stack>
          )}
        </CardContent>
      </Card>

      {patientId && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Records
            </Typography>
            {records.isLoading ? (
              <Loading />
            ) : records.data && records.data.length ? (
              <Stack spacing={1.5}>
                {records.data.map((r) => (
                  <Box
                    key={r.id}
                    sx={{ border: '1px solid', borderColor: 'divider', p: 1.5, borderRadius: 2 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <MuiLink
                        component="button"
                        onClick={() => openRecordFile(r.id)}
                        sx={{ fontWeight: 600 }}
                      >
                        📄 {r.fileName}
                      </MuiLink>
                      <Chip
                        size="small"
                        color={summaryColor[r.summaryStatus]}
                        label={SummaryStatusName[r.summaryStatus]}
                      />
                    </Box>
                    {r.aiSummary && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1, whiteSpace: 'pre-line' }}
                      >
                        {r.aiSummary}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No records for this patient.
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
