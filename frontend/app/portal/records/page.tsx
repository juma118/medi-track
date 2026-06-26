'use client'

import { Card, CardContent, Box, Typography, Chip, Stack, Link as MuiLink } from '@mui/material'
import { useMyRecords, openMyRecordFile } from '@/lib/portalHooks'
import { PageHeader, Loading, summaryColor } from '@/components/ui'
import { SummaryStatusName } from '@/lib/types'

export default function PortalRecords() {
  const records = useMyRecords()
  return (
    <Box>
      <PageHeader title="My Medical Records" subtitle="Documents and AI summaries shared by your clinic" />
      <Card>
        <CardContent>
          {records.isLoading ? <Loading /> : records.data && records.data.length ? (
            <Stack spacing={1.5}>
              {records.data.map((r) => (
                <Box key={r.id} sx={{ border: '1px solid', borderColor: 'divider', p: 1.5, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <MuiLink component="button" onClick={() => openMyRecordFile(r.id)} sx={{ fontWeight: 600 }}>📄 {r.fileName}</MuiLink>
                    <Chip size="small" color={summaryColor[r.summaryStatus]} label={SummaryStatusName[r.summaryStatus]} />
                  </Box>
                  {r.aiSummary && <Typography variant="body2" color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line' }}>{r.aiSummary}</Typography>}
                </Box>
              ))}
            </Stack>
          ) : <Typography variant="body2" color="text.secondary">No records available.</Typography>}
        </CardContent>
      </Card>
    </Box>
  )
}
