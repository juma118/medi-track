'use client'

import { useState } from 'react'
import { Card, CardContent, Box, Stack, Button, TextField } from '@mui/material'
import { useMyMessages, useSendMessage } from '@/lib/portalHooks'
import { PageHeader, Loading } from '@/components/ui'
import { Thread } from '@/components/Thread'

export default function PortalMessages() {
  const messages = useMyMessages()
  const send = useSendMessage()
  const [text, setText] = useState('')
  const submit = () => { if (text.trim()) { send.mutate({ body: text }); setText('') } }

  return (
    <Box>
      <PageHeader title="Messages" subtitle="Securely message your care team" />
      <Card>
        <CardContent>
          {messages.isLoading ? <Loading /> : <Thread messages={messages.data ?? []} mineIsPatient />}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <TextField size="small" fullWidth placeholder="Type a message…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
            <Button variant="contained" onClick={submit} disabled={send.isPending || !text.trim()}>Send</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
