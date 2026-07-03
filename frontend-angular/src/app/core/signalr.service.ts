import { Injectable, inject } from '@angular/core'
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import { API_BASE } from './api'
import { AuthService } from './auth.service'

/**
 * Port of lib/signalr.ts — a single lazily-created hub connection used to
 * receive real-time "SummaryReady" notifications for a patient.
 */
@Injectable({ providedIn: 'root' })
export class SignalrService {
  private readonly auth = inject(AuthService)
  private connection: HubConnection | null = null

  private async getConnection(): Promise<HubConnection> {
    if (this.connection) return this.connection
    this.connection = new HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/notifications`, {
        accessTokenFactory: () => this.auth.accessToken() ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build()
    await this.connection.start()
    return this.connection
  }

  async subscribeToPatient(patientId: string, onSummaryReady: (data: unknown) => void): Promise<void> {
    const conn = await this.getConnection()
    conn.off('SummaryReady')
    conn.on('SummaryReady', onSummaryReady)
    await conn.invoke('SubscribeToPatient', patientId)
  }
}
