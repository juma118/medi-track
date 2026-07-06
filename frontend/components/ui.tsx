'use client'

import { Box, CircularProgress, Typography } from '@mui/material'
import type { AppointmentStatus, RefillStatus, SummaryStatus } from '@/lib/types'

export function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress />
    </Box>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        mb: 3,
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box>
        <Typography variant="h4">{title}</Typography>
        {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
      </Box>
      {action}
    </Box>
  )
}

type ChipColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

export const statusColor: Record<AppointmentStatus, ChipColor> = {
  1: 'info',
  2: 'secondary',
  3: 'success',
  4: 'error',
  5: 'warning',
}
export const summaryColor: Record<SummaryStatus, ChipColor> = {
  1: 'warning',
  2: 'warning',
  3: 'success',
  4: 'error',
}
export const refillColor: Record<RefillStatus, ChipColor> = {
  1: 'warning',
  2: 'success',
  3: 'error',
}
