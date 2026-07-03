import { Injectable, inject } from '@angular/core'
import {
  QueryClient,
  injectMutation,
  injectQuery,
} from '@tanstack/angular-query-experimental'
import { HttpApi } from './http-api'
import { AuthService } from './auth.service'
import type {
  Appointment,
  AuthResponse,
  DashboardStats,
  Doctor,
  MedicalRecord,
  Paged,
  Patient,
  Prescription,
  SymptomAnalysis,
} from './models'

/**
 * Staff-side queries & mutations — a port of lib/hooks.ts. Each method mirrors
 * one React Query hook and must be called from a component's injection context
 * (field initializer), exactly like the hooks were called from render.
 *
 * Signal/accessor arguments make the query reactive: when the accessor's value
 * changes the query key changes and TanStack refetches (like a re-render).
 */
@Injectable({ providedIn: 'root' })
export class ClinicApi {
  private readonly api = inject(HttpApi)
  private readonly auth = inject(AuthService)
  private readonly qc = inject(QueryClient)

  // ---- Auth ----
  login() {
    return injectMutation(() => ({
      mutationFn: (body: { email: string; password: string }) =>
        this.api.post<AuthResponse>('/auth/login', body),
      onSuccess: (data: AuthResponse) => this.auth.setAuth(data),
    }))
  }

  // ---- Patients ----
  patients(params: () => { search: string; page: number; bloodType: string }) {
    return injectQuery(() => {
      const { search, page, bloodType } = params()
      return {
        queryKey: ['patients', search, page, bloodType],
        queryFn: () =>
          this.api.get<Paged<Patient>>('/patients', { search, bloodType, page, pageSize: 10 }),
      }
    })
  }

  patient(id: () => string) {
    return injectQuery(() => ({
      queryKey: ['patient', id()],
      queryFn: () => this.api.get<Patient>(`/patients/${id()}`),
      enabled: !!id(),
    }))
  }

  createPatient() {
    return injectMutation(() => ({
      mutationFn: (body: Partial<Patient>) => this.api.post<Patient>('/patients', body),
      onSuccess: () => this.qc.invalidateQueries({ queryKey: ['patients'] }),
    }))
  }

  // ---- Doctors ----
  doctors() {
    return injectQuery(() => ({
      queryKey: ['doctors'],
      queryFn: () => this.api.get<Doctor[]>('/doctors'),
    }))
  }

  // ---- Appointments ----
  patientAppointments(patientId: () => string) {
    return injectQuery(() => ({
      queryKey: ['appointments', patientId()],
      queryFn: () => this.api.get<Appointment[]>(`/patients/${patientId()}/appointments`),
      enabled: !!patientId(),
    }))
  }

  todayAppointments() {
    return injectQuery(() => ({
      queryKey: ['appointments', 'today'],
      queryFn: () => this.api.get<Appointment[]>('/appointments/today'),
    }))
  }

  appointment(id: () => string) {
    return injectQuery(() => ({
      queryKey: ['appointment', id()],
      queryFn: () => this.api.get<Appointment>(`/appointments/${id()}`),
      enabled: !!id(),
    }))
  }

  createAppointment() {
    return injectMutation(() => ({
      mutationFn: (body: { patientId: string; doctorId: string; scheduledAt: string; reason?: string }) =>
        this.api.post<Appointment>('/appointments', body),
      onSuccess: () => this.qc.invalidateQueries({ queryKey: ['appointments'] }),
    }))
  }

  setDiagnosis() {
    return injectMutation(() => ({
      mutationFn: ({ id, diagnosis }: { id: string; diagnosis: string }) =>
        this.api.put<Appointment>(`/appointments/${id}/diagnosis`, { diagnosis }),
      onSuccess: () => this.qc.invalidateQueries({ queryKey: ['appointments'] }),
    }))
  }

  setStatus() {
    return injectMutation(() => ({
      mutationFn: ({ id, status }: { id: string; status: number }) =>
        this.api.put<Appointment>(`/appointments/${id}/status`, { status }),
      onSuccess: () => this.qc.invalidateQueries({ queryKey: ['appointments'] }),
    }))
  }

  // ---- Prescriptions ----
  patientPrescriptions(patientId: () => string) {
    return injectQuery(() => ({
      queryKey: ['prescriptions', patientId()],
      queryFn: () => this.api.get<Prescription[]>(`/patients/${patientId()}/prescriptions`),
      enabled: !!patientId(),
    }))
  }

  createPrescription() {
    return injectMutation(() => ({
      mutationFn: (body: {
        appointmentId: string
        medication: string
        dosage: string
        frequency: string
        expiryDate?: string
      }) => this.api.post<Prescription>('/prescriptions', body),
      onSuccess: () => this.qc.invalidateQueries({ queryKey: ['prescriptions'] }),
    }))
  }

  // ---- Medical records ----
  patientRecords(patientId: () => string) {
    return injectQuery(() => ({
      queryKey: ['records', patientId()],
      queryFn: () => this.api.get<MedicalRecord[]>(`/patients/${patientId()}/records`),
      enabled: !!patientId(),
      // Poll while any summary is still Pending/Processing (matches lib/hooks.ts).
      // The param is typed explicitly to keep TanStack's TData inference intact.
      refetchInterval: (query: { state: { data?: MedicalRecord[] } }) => {
        const data = query.state.data
        return data?.some((r) => r.summaryStatus === 1 || r.summaryStatus === 2) ? 3000 : false
      },
    }))
  }

  uploadRecord() {
    return injectMutation(() => ({
      mutationFn: ({ patientId, recordType, file }: { patientId: string; recordType: number; file: File }) => {
        const form = new FormData()
        form.append('patientId', patientId)
        form.append('recordType', String(recordType))
        form.append('file', file)
        return this.api.postForm<MedicalRecord>('/medical-records', form)
      },
      onSuccess: () => this.qc.invalidateQueries({ queryKey: ['records'] }),
    }))
  }

  openRecordFile(recordId: string): Promise<void> {
    return this.api.openFile(`/medical-records/${recordId}/file`)
  }

  // ---- Dashboard ----
  dashboard() {
    return injectQuery(() => ({
      queryKey: ['dashboard'],
      queryFn: () => this.api.get<DashboardStats>('/dashboard/stats'),
    }))
  }

  // ---- AI ----
  analyzeSymptoms() {
    return injectMutation(() => ({
      mutationFn: (body: { patientId: string; symptoms: string }) =>
        this.api.post<SymptomAnalysis>('/ai/analyze-symptoms', body),
    }))
  }

  patientChat() {
    return injectMutation(() => ({
      mutationFn: ({ patientId, question }: { patientId: string; question: string }) =>
        this.api.post<{ answer: string }>(`/ai/patients/${patientId}/chat`, { question }),
    }))
  }
}
