'use client'

import { createTheme } from '@mui/material/styles'

// Polished healthcare theme — teal/indigo accents, soft surfaces, rounded geometry.
const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: { main: '#0d9488', light: '#5eead4', dark: '#0f766e', contrastText: '#ffffff' },
    secondary: { main: '#4f46e5', light: '#818cf8', dark: '#3730a3' },
    success: { main: '#059669' },
    warning: { main: '#d97706' },
    error: { main: '#e11d48' },
    info: { main: '#0284c7' },
    background: { default: '#f4f6fb', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: '#64748b' },
    divider: 'rgba(15,23,42,0.08)',
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'var(--font-geist-sans), system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: '1px solid rgba(15,23,42,0.07)',
          boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 10, paddingInline: 18 } },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 14 } } },
    MuiTextField: { defaultProps: { size: 'small' } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiAppBar: { defaultProps: { elevation: 0 } },
  },
})

export default theme
