export type Role = 1 | 2 | 3 // 1 = Doctor, 2 = Receptionist, 3 = Patient

export const RoleName: Record<Role, string> = { 1: 'Doctor', 2: 'Receptionist', 3: 'Patient' }

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  fullName: string
  role: Role
  expiresAt: string
}

export interface Patient {
  id: string
  fullName: string
  dateOfBirth: string
  bloodType?: string | null
  phone?: string | null
  email?: string | null
  medicalHistory?: string | null
  createdAt: string
}

export interface Paged<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type AppointmentStatus = 1 | 2 | 3 | 4 | 5
export const StatusName: Record<AppointmentStatus, string> = {
  1: 'Scheduled',
  2: 'Checked In',
  3: 'Completed',
  4: 'Cancelled',
  5: 'No Show',
}

export interface Appointment {
  id: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  scheduledAt: string
  status: AppointmentStatus
  reason?: string | null
  diagnosis?: string | null
}

export interface Doctor {
  id: string
  fullName: string
  specialty: string
}

export interface Prescription {
  id: string
  appointmentId: string
  medication: string
  dosage: string
  frequency: string
  expiryDate?: string | null
}

export type SummaryStatus = 1 | 2 | 3 | 4
export const SummaryStatusName: Record<SummaryStatus, string> = {
  1: 'Pending',
  2: 'Processing',
  3: 'Ready',
  4: 'Failed',
}

export interface MedicalRecord {
  id: string
  patientId: string
  fileName: string
  recordType: number
  aiSummary?: string | null
  summaryStatus: SummaryStatus
  createdAt: string
}

export interface DashboardStats {
  totalPatients: number
  todaysAppointments: number
  pendingAppointments: number
  activePrescriptions: number
  newPatientsThisMonth: number
  appointmentsLast7Days: { day: string; count: number }[]
}

export interface SymptomAnalysis {
  possibleConditions: string[]
  urgency: string
  suggestedTests: string[]
  disclaimer: string
}

export type RefillStatus = 1 | 2 | 3
export const RefillStatusName: Record<RefillStatus, string> = {
  1: 'Requested',
  2: 'Approved',
  3: 'Denied',
}

export interface RefillRequest {
  id: string
  prescriptionId: string
  medication: string
  status: RefillStatus
  patientNote?: string | null
  responseNote?: string | null
  createdAt: string
  resolvedAt?: string | null
  patientName?: string | null
}

export interface Message {
  id: string
  fromPatient: boolean
  senderName: string
  body: string
  createdAt: string
  read: boolean
}
