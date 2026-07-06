import { HubConnectionBuilder, HubConnection, LogLevel } from '@microsoft/signalr'
import { API_BASE } from './api'
import { useAuth } from './auth'

let connection: HubConnection | null = null

export async function getConnection(): Promise<HubConnection> {
  if (connection) return connection
  connection = new HubConnectionBuilder()
    .withUrl(`${API_BASE}/hubs/notifications`, {
      accessTokenFactory: () => useAuth.getState().accessToken ?? '',
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build()
  await connection.start()
  return connection
}

export async function subscribeToPatient(
  patientId: string,
  onSummaryReady: (data: unknown) => void,
) {
  const conn = await getConnection()
  conn.off('SummaryReady')
  conn.on('SummaryReady', onSummaryReady)
  await conn.invoke('SubscribeToPatient', patientId)
}
