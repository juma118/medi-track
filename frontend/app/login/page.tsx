'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box, Card, CardContent, Typography, TextField, Button, Avatar, Stack, Alert, Divider, Chip,
} from '@mui/material'
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded'
import { useLogin } from '@/lib/hooks'
import { useAuth, isPatient } from '@/lib/auth'

const demos = [
  { label: 'Doctor', email: 'doctor@meditrack.dev', password: 'Doctor123!' },
  { label: 'Receptionist', email: 'reception@meditrack.dev', password: 'Reception123!' },
  { label: 'Patient', email: 'patient@meditrack.dev', password: 'Patient123!' },
]

export default function LoginPage() {
  const router = useRouter()
  const login = useLogin()
  const { accessToken, role } = useAuth()
  const [email, setEmail] = useState('doctor@meditrack.dev')
  const [password, setPassword] = useState('Doctor123!')

  // If already signed in, bounce to the right home.
  useEffect(() => {
    if (accessToken) router.replace(isPatient(role) ? '/portal' : '/dashboard')
  }, [accessToken, role, router])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password }, {
      onSuccess: (data) => router.replace(isPatient(data.role) ? '/portal' : '/dashboard'),
    })
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, background: 'linear-gradient(160deg, #0f766e, #4f46e5)' }}>
      <Card sx={{ width: '100%', maxWidth: 420 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack sx={{ alignItems: 'center', mb: 3 }} spacing={1}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52 }}><LocalHospitalRoundedIcon /></Avatar>
            <Typography variant="h5">MediTrack</Typography>
            <Typography variant="body2" color="text.secondary">Sign in to continue</Typography>
          </Stack>

          <form onSubmit={submit}>
            <Stack spacing={2}>
              <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth required />
              <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth required />
              {login.isError && <Alert severity="error">Invalid email or password.</Alert>}
              <Button type="submit" variant="contained" size="large" disabled={login.isPending}>
                {login.isPending ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ my: 3 }}>Demo accounts</Divider>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', justifyContent: 'center' }} useFlexGap>
            {demos.map((d) => (
              <Chip key={d.email} label={d.label} variant="outlined" onClick={() => { setEmail(d.email); setPassword(d.password) }} />
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
