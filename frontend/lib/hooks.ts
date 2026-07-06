import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import { useAuth } from './auth'
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
} from './types'

// ---- Auth ----
export function useLogin() {
  const setAuth = useAuth((s) => s.setAuth)
  return useMutation({
    mutationFn: async (body: { email: string; password: string }) =>
      (await api.post<AuthResponse>('/auth/login', body)).data,
    onSuccess: (data) => setAuth(data),
  })
}

// ---- Patients ----
export function usePatients(search: string, page = 1, bloodType = '') {
  return useQuery({
    queryKey: ['patients', search, page, bloodType],
    queryFn: async () =>
      (
        await api.get<Paged<Patient>>('/patients', {
          params: { search, bloodType, page, pageSize: 10 },
        })
      ).data,
  })
}
export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: async () => (await api.get<Patient>(`/patients/${id}`)).data,
    enabled: !!id,
  })
}
export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: Partial<Patient>) => (await api.post<Patient>('/patients', body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

// ---- Doctors ----
export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: async () => (await api.get<Doctor[]>('/doctors')).data,
  })
}

// ---- Appointments ----
export function usePatientAppointments(patientId: string) {
  return useQuery({
    queryKey: ['appointments', patientId],
    queryFn: async () => (await api.get<Appointment[]>(`/patients/${patientId}/appointments`)).data,
    enabled: !!patientId,
  })
}
export function useTodayAppointments() {
  return useQuery({
    queryKey: ['appointments', 'today'],
    queryFn: async () => (await api.get<Appointment[]>('/appointments/today')).data,
  })
}
export function useAppointments(from: string, to: string) {
  return useQuery({
    queryKey: ['appointments', 'range', from, to],
    queryFn: async () =>
      (await api.get<Appointment[]>('/appointments', { params: { from, to } })).data,
    enabled: !!from && !!to,
  })
}
export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => (await api.get<Appointment>(`/appointments/${id}`)).data,
    enabled: !!id,
  })
}
export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: {
      patientId: string
      doctorId: string
      scheduledAt: string
      reason?: string
    }) => (await api.post<Appointment>('/appointments', body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}
export function useSetDiagnosis() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, diagnosis }: { id: string; diagnosis: string }) =>
      (await api.put<Appointment>(`/appointments/${id}/diagnosis`, { diagnosis })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}
export function useSetStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: number }) =>
      (await api.put<Appointment>(`/appointments/${id}/status`, { status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

// ---- Prescriptions ----
export function usePatientPrescriptions(patientId: string) {
  return useQuery({
    queryKey: ['prescriptions', patientId],
    queryFn: async () =>
      (await api.get<Prescription[]>(`/patients/${patientId}/prescriptions`)).data,
    enabled: !!patientId,
  })
}
export function useCreatePrescription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: {
      appointmentId: string
      medication: string
      dosage: string
      frequency: string
      expiryDate?: string
    }) => (await api.post<Prescription>('/prescriptions', body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['prescriptions'] }),
  })
}

// ---- Medical records ----
export function usePatientRecords(patientId: string) {
  return useQuery({
    queryKey: ['records', patientId],
    queryFn: async () => (await api.get<MedicalRecord[]>(`/patients/${patientId}/records`)).data,
    enabled: !!patientId,
    refetchInterval: (q) =>
      (q.state.data as MedicalRecord[] | undefined)?.some(
        (r) => r.summaryStatus === 1 || r.summaryStatus === 2,
      )
        ? 3000
        : false,
  })
}
export function useUploadRecord() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      patientId,
      recordType,
      file,
    }: {
      patientId: string
      recordType: number
      file: File
    }) => {
      const form = new FormData()
      form.append('patientId', patientId)
      form.append('recordType', String(recordType))
      form.append('file', file)
      return (await api.post<MedicalRecord>('/medical-records', form)).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['records'] }),
  })
}
export async function openRecordFile(recordId: string) {
  const res = await api.get(`/medical-records/${recordId}/file`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data as Blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

// ---- Dashboard ----
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => (await api.get<DashboardStats>('/dashboard/stats')).data,
  })
}

// ---- AI ----
export function useAnalyzeSymptoms() {
  return useMutation({
    mutationFn: async (body: { patientId: string; symptoms: string }) =>
      (await api.post<SymptomAnalysis>('/ai/analyze-symptoms', body)).data,
  })
}
export function usePatientChat() {
  return useMutation({
    mutationFn: async ({ patientId, question }: { patientId: string; question: string }) =>
      (await api.post<{ answer: string }>(`/ai/patients/${patientId}/chat`, { question })).data,
  })
}
