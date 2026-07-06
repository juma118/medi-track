'use client'

import { Card, CardContent, Box, Typography, Chip, Stack, Button } from '@mui/material'
import { useMyPrescriptions, useMyRefills, useRequestRefill } from '@/lib/portalHooks'
import { PageHeader, Loading, refillColor } from '@/components/ui'
import { RefillStatusName } from '@/lib/types'

export default function PortalPrescriptions() {
  const meds = useMyPrescriptions()
  const refills = useMyRefills()
  const request = useRequestRefill()
  const pendingFor = (rxId: string) =>
    refills.data?.find((r) => r.prescriptionId === rxId && r.status === 1)

  return (
    <Box>
      <PageHeader title="My Prescriptions" subtitle="Active medications and refill requests" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Active medications
            </Typography>
            {meds.isLoading ? (
              <Loading />
            ) : meds.data && meds.data.length ? (
              <Stack spacing={1.5}>
                {meds.data.map((m) => {
                  const pending = pendingFor(m.id)
                  return (
                    <Box
                      key={m.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        p: 1.5,
                        borderRadius: 2,
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                          {m.medication} · {m.dosage}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {m.frequency}
                        </Typography>
                      </Box>
                      {pending ? (
                        <Chip size="small" color="warning" label="Refill requested" />
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={request.isPending}
                          onClick={() =>
                            request.mutate({ prescriptionId: m.id, note: 'Refill please' })
                          }
                        >
                          Request refill
                        </Button>
                      )}
                    </Box>
                  )
                })}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No active medications.
              </Typography>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Refill requests
            </Typography>
            {refills.isLoading ? (
              <Loading />
            ) : refills.data && refills.data.length ? (
              <Stack spacing={1}>
                {refills.data.map((r) => (
                  <Box
                    key={r.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: 'grey.50',
                      p: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{r.medication}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(r.createdAt).toLocaleDateString()}
                        {r.responseNote ? ` · ${r.responseNote}` : ''}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      color={refillColor[r.status]}
                      label={RefillStatusName[r.status]}
                    />
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No refill requests yet.
              </Typography>
            )}
          </CardContent>
        </Card>
      </div>
    </Box>
  )
}
