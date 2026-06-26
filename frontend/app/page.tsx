'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AppBar, Toolbar, Container, Box, Typography, Button, Card, CardContent, Stack, Chip, Avatar,
} from '@mui/material'
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded'
import PersonRoundedIcon from '@mui/icons-material/PersonRounded'
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded'
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded'
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { useAuth, isPatient } from '@/lib/auth'

const roles = [
  {
    icon: <PersonRoundedIcon />, title: 'Patients', color: '#0d9488',
    points: ['Book & track appointments', 'View records and AI summaries', 'Request prescription refills', 'Message your care team'],
  },
  {
    icon: <MedicalServicesRoundedIcon />, title: 'Doctors', color: '#4f46e5',
    points: ['Diagnoses & prescriptions', 'AI symptom analysis', 'Patient-history chat (RAG)', 'Review refill requests'],
  },
  {
    icon: <SupportAgentRoundedIcon />, title: 'Receptionists', color: '#0284c7',
    points: ['Register & search patients', 'Book appointments', 'Provision portal accounts', 'Daily schedule overview'],
  },
]

const features = [
  { icon: <SmartToyRoundedIcon />, title: 'AI assistant', desc: 'Symptom analysis, document summarization, and grounded patient-history chat.' },
  { icon: <BoltRoundedIcon />, title: 'Event-driven', desc: 'Kafka-backed workers handle AI, notifications, and audit asynchronously.' },
  { icon: <InsightsRoundedIcon />, title: 'Live dashboard', desc: 'Redis-cached KPIs and real-time updates over SignalR.' },
  { icon: <ShieldRoundedIcon />, title: 'Role-based access', desc: 'Scoped, audited access for doctors, receptionists, and patients.' },
]

export default function Home() {
  const router = useRouter()
  const { accessToken, role, fullName } = useAuth()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const loggedIn = mounted && !!accessToken
  const goToApp = () => router.push(isPatient(role) ? '/portal' : '/dashboard')

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" sx={{ background: 'linear-gradient(90deg, #0f766e 0%, #0d9488 55%, #14b8a6 100%)', color: 'white', boxShadow: '0 2px 14px rgba(13,148,136,0.3)' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 1.25 }}>
            <Avatar sx={{ bgcolor: 'white', color: 'primary.dark', width: 36, height: 36 }}><LocalHospitalRoundedIcon fontSize="small" /></Avatar>
            <Typography variant="h6" sx={{ fontWeight: 800, flexGrow: 1, color: 'white', letterSpacing: '-0.01em' }}>MediTrack</Typography>
            {loggedIn ? (
              <>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', display: { xs: 'none', sm: 'block' }, mr: 1 }}>Hi, {fullName?.split(' ')[0]}</Typography>
                <Button variant="contained" color="inherit" sx={{ bgcolor: 'white', color: 'primary.dark', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }} endIcon={<ArrowForwardRoundedIcon />} onClick={goToApp}>Open app</Button>
              </>
            ) : (
              <Button variant="contained" color="inherit" sx={{ bgcolor: 'white', color: 'primary.dark', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }} onClick={() => router.push('/login')}>Sign in</Button>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero */}
      <Box sx={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(155deg, #0f766e 0%, #0d9488 45%, #f59e0b 165%)', color: 'white' }}>
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.18, backgroundImage: 'radial-gradient(circle at 15% 15%, #fff 0, transparent 38%), radial-gradient(circle at 90% 10%, #fde68a 0, transparent 30%)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', py: { xs: 7, md: 12 } }}>
          <div className="grid items-center gap-10 md:grid-cols-2">
            <Box>
              <Chip label="AI Powered · HealthTech Platform" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 3, fontWeight: 600 }} />
              <Typography variant="h2" sx={{ fontSize: { xs: 36, md: 56 }, lineHeight: 1.06, mb: 2 }}>
                Caring for patients, doctors &amp; clinics — together.
              </Typography>
              <Typography sx={{ fontSize: { xs: 16, md: 19 }, opacity: 0.94, mb: 4, maxWidth: 560 }}>
                Manage patients, appointments, records and prescriptions — with an AI assistant and a warm, self-service patient portal.
              </Typography>
              <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {loggedIn ? (
                  <Button size="large" variant="contained" color="inherit" sx={{ color: 'primary.dark', bgcolor: 'white' }} endIcon={<ArrowForwardRoundedIcon />} onClick={goToApp}>
                    Go to your {isPatient(role) ? 'portal' : 'dashboard'}
                  </Button>
                ) : (
                  <>
                    <Button size="large" variant="contained" color="inherit" sx={{ color: 'primary.dark', bgcolor: 'white' }} endIcon={<ArrowForwardRoundedIcon />} onClick={() => router.push('/login')}>
                      Sign in
                    </Button>
                    <Button size="large" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)' }} href="#roles">
                      Explore roles
                    </Button>
                  </>
                )}
              </Stack>
            </Box>

            {/* Warm, healthy hero image */}
            <Box sx={{ position: 'relative', display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  height: 420, borderRadius: 5, overflow: 'hidden',
                  boxShadow: '0 30px 60px -15px rgba(15,23,42,0.45)',
                  border: '6px solid rgba(255,255,255,0.5)',
                  background: 'linear-gradient(135deg, #fcd34d, #fb923c)',
                  backgroundImage: "url('https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=900&q=80')",
                  backgroundSize: 'cover', backgroundPosition: 'center',
                }}
              />
              <Card sx={{ position: 'absolute', bottom: -18, left: -18, px: 2, py: 1.25, display: 'flex', alignItems: 'center', gap: 1.25, bgcolor: 'white' }}>
                <Avatar variant="rounded" sx={{ bgcolor: 'success.main', width: 38, height: 38 }}><SmartToyRoundedIcon /></Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1 }}>AI summaries</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>in seconds, not minutes</Typography>
                </Box>
              </Card>
            </Box>
          </div>
        </Container>
      </Box>

      {/* Feature strip */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title} sx={{ height: '100%' }}>
              <CardContent>
                <Avatar variant="rounded" sx={{ bgcolor: 'primary.light', color: 'primary.dark', mb: 1.5 }}>{f.icon}</Avatar>
                <Typography variant="h6" sx={{ mb: 0.5 }}>{f.title}</Typography>
                <Typography variant="body2" color="text.secondary">{f.desc}</Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>

      {/* Role sections */}
      <Box id="roles" sx={{ bgcolor: 'white', borderTop: '1px solid rgba(15,23,42,0.06)', borderBottom: '1px solid rgba(15,23,42,0.06)' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ mb: 1 }}>Built for everyone in the clinic</Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 560, mx: 'auto' }}>
              A tailored experience per role — patients get self-service, staff get the tools they need.
            </Typography>
          </Box>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {roles.map((r) => (
              <Card key={r.title} sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                <Box sx={{ height: 6, bgcolor: r.color }} />
                <CardContent sx={{ p: 3 }}>
                  <Avatar variant="rounded" sx={{ bgcolor: r.color, mb: 2 }}>{r.icon}</Avatar>
                  <Typography variant="h5" sx={{ mb: 1.5 }}>{r.title}</Typography>
                  <Stack spacing={1}>
                    {r.points.map((p) => (
                      <Stack key={p} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: r.color }} />
                        <Typography variant="body2" color="text.secondary">{p}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </Box>

      {/* CTA */}
      <Container maxWidth="lg" sx={{ py: { xs: 7, md: 10 } }}>
        <Card sx={{ background: 'linear-gradient(120deg, #0f172a, #1e293b)', color: 'white', textAlign: 'center', p: { xs: 4, md: 7 } }}>
          <Typography variant="h4" sx={{ mb: 1 }}>Ready to get started?</Typography>
          <Typography sx={{ opacity: 0.8, mb: 3 }}>Sign in with a demo account to explore the full platform.</Typography>
          <Button size="large" variant="contained" onClick={() => router.push(loggedIn ? (isPatient(role) ? '/portal' : '/dashboard') : '/login')}>
            {loggedIn ? 'Open the app' : 'Sign in'}
          </Button>
          <Typography variant="caption" sx={{ display: 'block', mt: 3, opacity: 0.6 }}>
            Demo: doctor@meditrack.dev · reception@meditrack.dev · patient@meditrack.dev
          </Typography>
        </Card>
      </Container>

      <Box component="footer" sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">MediTrack — MVP demo · synthetic data only</Typography>
      </Box>
    </Box>
  )
}
