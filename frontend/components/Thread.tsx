'use client'

import { Box, Typography } from '@mui/material'
import type { Message } from '@/lib/types'

export function Thread({ messages, mineIsPatient }: { messages: Message[]; mineIsPatient: boolean }) {
  if (messages.length === 0) return <Typography variant="body2" color="text.secondary">No messages yet.</Typography>
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 340, overflow: 'auto' }}>
      {messages.map((m) => {
        const mine = m.fromPatient === mineIsPatient
        return (
          <Box key={m.id} sx={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
            <Box sx={{
              maxWidth: '78%', px: 1.5, py: 1, borderRadius: 2,
              bgcolor: mine ? 'primary.main' : 'grey.100', color: mine ? 'primary.contrastText' : 'text.primary',
            }}>
              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>{m.senderName}</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{m.body}</Typography>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
