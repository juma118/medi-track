'use client'

import { Card, CardContent, Box, Typography, Stack, Button } from '@mui/material'
import { usePendingRefills, useResolveRefill } from '@/lib/portalHooks'
import { PageHeader, Loading } from '@/components/ui'

export default function RefillRequestsPage() {
  const refills = usePendingRefills()
  const resolve = useResolveRefill()

  return (
    <Box>
      <PageHeader title="Refill Requests" subtitle="Review and approve patient refill requests" />
      <Card>
        <CardContent>
          {refills.isLoading ? (
            <Loading />
          ) : refills.data && refills.data.length ? (
            <Stack spacing={1.5}>
              {refills.data.map((r) => (
                <Box
                  key={r.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 2,
                    borderRadius: 2,
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{r.medication}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {r.patientName} · {new Date(r.createdAt).toLocaleDateString()}
                    </Typography>
                    {r.patientNote && (
                      <Typography variant="caption" color="text.secondary">
                        “{r.patientNote}”
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      disabled={resolve.isPending}
                      onClick={() =>
                        resolve.mutate({ id: r.id, approve: true, responseNote: 'Approved' })
                      }
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      disabled={resolve.isPending}
                      onClick={() =>
                        resolve.mutate({
                          id: r.id,
                          approve: false,
                          responseNote: 'Please book a visit',
                        })
                      }
                    >
                      Deny
                    </Button>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No pending refill requests.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
