import { Injectable, inject } from '@angular/core'
import {
  QueryClient,
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental'
import { HttpApi } from './http-api'
import type { Appointment, Doctor, MedicalRecord, Message, Patient, Prescription, RefillRequest } from './models'

/**
 * Patient-portal and clinic-side portal-management queries & mutations —
 * a port of lib/portalHooks.ts.
 */
@Injectable({ providedIn: 'root' })
export class PortalApi {
  private readonly api = inject(HttpApi)
  private readonly qc = inject(QueryClient)

  // ---- Patient self-service ----
  myProfile() {
    return injectQuery(() => ({
      queryKey: ['portal', 'me'],
      queryFn: () => this.api.get<Patient>('/portal/me'),
    }))
  }

  myAppointments() {
    return injectQuery(() => ({
      queryKey: ['portal', 'appointments'],
      queryFn: () => this.api.get<Appointment[]>('/portal/appointments'),
    }))
  }

  myPrescriptions() {
    return injectQuery(() => ({
      queryKey: ['portal', 'prescriptions'],
      queryFn: () => this.api.get<Prescription[]>('/portal/prescriptions'),
    }))
  }

  myRecords() {
    return injectQuery(() => ({
      queryKey: ['portal', 'records'],
      queryFn: () => this.api.get<MedicalRecord[]>('/portal/records'),
    }))
  }

  portalDoctors() {
    return injectQuery(() => ({
      queryKey: ['portal', 'doctors'],
      queryFn: () => this.api.get<Doctor[]>('/portal/doctors'),
    }))
  }

  myRefills() {
    return injectQuery(() => ({
      queryKey: ['portal', 'refills'],
      queryFn: () => this.api.get<RefillRequest[]>('/portal/refills'),
    }))
  }

  myMessages() {
    return injectQuery(() => ({
      queryKey: ['portal', 'messages'],
      queryFn: () => this.api.get<Message[]>('/portal/messages'),
      refetchInterval: 5000,
    }))
  }

  selfBook() {
    return injectMutation(() => ({
      mutationFn: (body: { doctorId: string; scheduledAt: string; reason?: string }) =>
        this.api.post<Appointment>('/portal/appointments', body),
      onSuccess: () => this.qc.invalidateQueries({ queryKey: ['portal', 'appointments'] }),
    }))
  }

  requestRefill() {
    return injectMutation(() => ({
      mutationFn: (body: { prescriptionId: string; note?: string }) =>
        this.api.post<RefillRequest>('/portal/refills', body),
      onSuccess: () => this.qc.invalidateQueries({ queryKey: ['portal', 'refills'] }),
    }))
  }

  sendMessage() {
    return injectMutation(() => ({
      mutationFn: (body: { body: string }) => this.api.post<Message>('/portal/messages', body),
      onSuccess: () => this.qc.invalidateQueries({ queryKey: ['portal', 'messages'] }),
    }))
  }

  openMyRecordFile(recordId: string): Promise<void> {
    return this.api.openFile(`/portal/records/${recordId}/file`)
  }

  // ---- Clinic-side portal management ----
  pendingRefills() {
    return injectQuery(() => ({
      queryKey: ['refill-requests'],
      queryFn: () => this.api.get<RefillRequest[]>('/refill-requests'),
    }))
  }

  resolveRefill() {
    return injectMutation(() => ({
      mutationFn: ({ id, approve, responseNote }: { id: string; approve: boolean; responseNote?: string }) =>
        this.api.put<RefillRequest>(`/refill-requests/${id}`, { approve, responseNote }),
      onSuccess: () => this.qc.invalidateQueries({ queryKey: ['refill-requests'] }),
    }))
  }

  patientThread(patientId: () => string) {
    return injectQuery(() => ({
      queryKey: ['thread', patientId()],
      queryFn: () => this.api.get<Message[]>(`/patients/${patientId()}/messages`),
      enabled: !!patientId(),
      refetchInterval: 5000,
    }))
  }

  replyToPatient(patientId: () => string) {
    return injectMutation(() => ({
      mutationFn: (body: { body: string }) =>
        this.api.post<Message>(`/patients/${patientId()}/messages`, body),
      onSuccess: () => this.qc.invalidateQueries({ queryKey: ['thread', patientId()] }),
    }))
  }

  createPatientAccount(patientId: () => string) {
    return injectMutation(() => ({
      mutationFn: (body: { email: string; password: string }) =>
        this.api.post(`/patients/${patientId()}/account`, body),
      onSuccess: () => this.qc.invalidateQueries({ queryKey: ['patient', patientId()] }),
    }))
  }
}
