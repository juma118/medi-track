'use client'

import { useState } from 'react'
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
  Alert,
} from '@mui/material'
import { useAnalyzeSymptoms, usePatientChat, usePatients } from '@/lib/hooks'
import { PageHeader, Loading } from '@/components/ui'

const urgencyColor: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  Low: 'success',
  Medium: 'warning',
  High: 'error',
}

export default function AiPage() {
  const patients = usePatients('', 1)
  const [patientId, setPatientId] = useState('')

  return (
    <Box>
      <PageHeader title="AI Assistant" subtitle="Symptom analysis and patient-history chat" />
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            select
            label="Patient context"
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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SymptomAnalyzer patientId={patientId} />
        <PatientChat patientId={patientId} />
      </div>
    </Box>
  )
}

function SymptomAnalyzer({ patientId }: { patientId: string }) {
  const [symptoms, setSymptoms] = useState('')
  const analyze = useAnalyzeSymptoms()
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          🧠 Symptom analyzer
        </Typography>
        <TextField
          multiline
          minRows={4}
          fullWidth
          placeholder="Describe the symptoms…"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />
        <Stack direction="row" spacing={1} sx={{ mt: 1.5, alignItems: 'center' }}>
          <Button
            variant="contained"
            disabled={!patientId || !symptoms || analyze.isPending}
            onClick={() => analyze.mutate({ patientId, symptoms })}
          >
            {analyze.isPending ? 'Analyzing…' : 'Analyze'}
          </Button>
          {!patientId && (
            <Typography variant="caption" color="text.secondary">
              Select a patient first.
            </Typography>
          )}
        </Stack>

        {analyze.data && (
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Urgency:
              </Typography>
              <Chip
                size="small"
                color={urgencyColor[analyze.data.urgency] ?? 'default'}
                label={analyze.data.urgency}
              />
            </Stack>
            <Typography variant="subtitle2" color="text.secondary">
              Possible conditions
            </Typography>
            <ul style={{ marginTop: 4 }}>
              {analyze.data.possibleConditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <Typography variant="subtitle2" color="text.secondary">
              Suggested tests
            </Typography>
            <ul style={{ marginTop: 4 }}>
              {analyze.data.suggestedTests.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <Alert severity="warning" sx={{ mt: 1 }}>
              {analyze.data.disclaimer}
            </Alert>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

function PatientChat({ patientId }: { patientId: string }) {
  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState<{ q: string; a: string }[]>([])
  const chat = usePatientChat()
  const ask = () => {
    if (!patientId || !question) return
    const q = question
    setQuestion('')
    chat.mutate(
      { patientId, question: q },
      { onSuccess: (res) => setHistory((h) => [...h, { q, a: res.answer }]) },
    )
  }
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 1.5 }}>
          💬 Patient history chat
        </Typography>
        <Box sx={{ maxHeight: 320, overflow: 'auto', mb: 1.5 }}>
          {history.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Ask about medications, history, past visits…
            </Typography>
          )}
          {history.map((m, i) => (
            <Box key={i} sx={{ mb: 1 }}>
              <Box
                sx={{
                  bgcolor: 'primary.light',
                  color: 'primary.dark',
                  p: 1,
                  borderRadius: 2,
                  mb: 0.5,
                }}
              >
                <Typography variant="body2">{m.q}</Typography>
              </Box>
              <Box sx={{ bgcolor: 'grey.100', p: 1, borderRadius: 2 }}>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {m.a}
                </Typography>
              </Box>
            </Box>
          ))}
          {chat.isPending && <Loading />}
        </Box>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            fullWidth
            placeholder="Ask a question…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask()}
          />
          <Button
            variant="contained"
            disabled={!patientId || !question || chat.isPending}
            onClick={ask}
          >
            Ask
          </Button>
        </Stack>
      </CardContent>
    </Card>
  )
}
