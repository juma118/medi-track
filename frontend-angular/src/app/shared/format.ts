// Date/time formatting helpers matching the React app's inline `toLocale*` calls.
export const fmtDate = (s?: string | null): string => (s ? new Date(s).toLocaleDateString() : '')

export const fmtDateTime = (s?: string | null): string => (s ? new Date(s).toLocaleString() : '')

export const fmtTime = (s?: string | null): string =>
  s ? new Date(s).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

export const fmtWeekday = (s: string): string =>
  new Date(s).toLocaleDateString(undefined, { weekday: 'short' })
