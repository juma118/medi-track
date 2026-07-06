import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type {
  Appointment,
  Doctor,
  MedicalRecord,
  Message,
  Patient,
  Prescription,
  RefillRequest,
} from './types'

// ---- Patient self-service ----
export function useMyProfile() {
  return useQuery({
    queryKey: ['portal', 'me'],
    queryFn: async () => (await api.get<Patient>('/portal/me')).data,
  })
}
export function useMyAppointments() {
  return useQuery({
    queryKey: ['portal', 'appointments'],
    queryFn: async () => (await api.get<Appointment[]>('/portal/appointments')).data,
  })
}
export function useMyPrescriptions() {
  return useQuery({
    queryKey: ['portal', 'prescriptions'],
    queryFn: async () => (await api.get<Prescription[]>('/portal/prescriptions')).data,
  })
}
export function useMyRecords() {
  return useQuery({
    queryKey: ['portal', 'records'],
    queryFn: async () => (await api.get<MedicalRecord[]>('/portal/records')).data,
  })
}
export function usePortalDoctors() {
  return useQuery({
    queryKey: ['portal', 'doctors'],
    queryFn: async () => (await api.get<Doctor[]>('/portal/doctors')).data,
  })
}
export function useMyRefills() {
  return useQuery({
    queryKey: ['portal', 'refills'],
    queryFn: async () => (await api.get<RefillRequest[]>('/portal/refills')).data,
  })
}
export function useMyMessages() {
  return useQuery({
    queryKey: ['portal', 'messages'],
    queryFn: async () => (await api.get<Message[]>('/portal/messages')).data,
    refetchInterval: 5000,
  })
}
export function useSelfBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: { doctorId: string; scheduledAt: string; reason?: string }) =>
      (await api.post<Appointment>('/portal/appointments', body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal', 'appointments'] }),
  })
}
export function useRequestRefill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: { prescriptionId: string; note?: string }) =>
      (await api.post<RefillRequest>('/portal/refills', body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal', 'refills'] }),
  })
}
export function useSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: { body: string }) =>
      (await api.post<Message>('/portal/messages', body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal', 'messages'] }),
  })
}
export async function openMyRecordFile(recordId: string) {
  const res = await api.get(`/portal/records/${recordId}/file`, { responseType: 'blob' })
  const url = URL.createObjectURL(res.data as Blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

// ---- Clinic-side portal management ----
export function usePendingRefills() {
  return useQuery({
    queryKey: ['refill-requests'],
    queryFn: async () => (await api.get<RefillRequest[]>('/refill-requests')).data,
  })
}
export function useResolveRefill() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      approve,
      responseNote,
    }: {
      id: string
      approve: boolean
      responseNote?: string
    }) => (await api.put<RefillRequest>(`/refill-requests/${id}`, { approve, responseNote })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['refill-requests'] }),
  })
}
export function usePatientThread(patientId: string) {
  return useQuery({
    queryKey: ['thread', patientId],
    queryFn: async () => (await api.get<Message[]>(`/patients/${patientId}/messages`)).data,
    enabled: !!patientId,
    refetchInterval: 5000,
  })
}
export function useReplyToPatient(patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: { body: string }) =>
      (await api.post<Message>(`/patients/${patientId}/messages`, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['thread', patientId] }),
  })
}
export function useCreatePatientAccount(patientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (body: { email: string; password: string }) =>
      (await api.post(`/patients/${patientId}/account`, body)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient', patientId] }),
  })
}
