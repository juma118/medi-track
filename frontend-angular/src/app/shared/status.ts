import type { AppointmentStatus, RefillStatus, SummaryStatus } from '../core/models'

// Port of the color maps in components/ui.tsx.
export type BadgeColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'

export const statusColor: Record<AppointmentStatus, BadgeColor> = {
  1: 'info',
  2: 'secondary',
  3: 'success',
  4: 'error',
  5: 'warning',
}

export const summaryColor: Record<SummaryStatus, BadgeColor> = {
  1: 'warning',
  2: 'warning',
  3: 'success',
  4: 'error',
}

export const refillColor: Record<RefillStatus, BadgeColor> = {
  1: 'warning',
  2: 'success',
  3: 'error',
}

export const urgencyColor: Record<string, BadgeColor> = {
  Low: 'success',
  Medium: 'warning',
  High: 'error',
}
