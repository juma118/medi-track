import { Injectable, computed, signal } from '@angular/core'
import type { AuthResponse, Role } from './models'

const STORAGE_KEY = 'meditrack-auth'

interface PersistedAuth {
  accessToken: string | null
  refreshToken: string | null
  fullName: string | null
  role: Role | null
}

/**
 * Port of the React app's Zustand `useAuth` store (lib/auth.ts).
 * State is held in signals and persisted to localStorage, mirroring the
 * persist middleware. Since this is a pure client app, hydration is synchronous.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly accessToken = signal<string | null>(null)
  readonly refreshToken = signal<string | null>(null)
  readonly fullName = signal<string | null>(null)
  readonly role = signal<Role | null>(null)
  readonly hydrated = signal(false)

  readonly isDoctorSig = computed(() => this.role() === 1)
  readonly isReceptionistSig = computed(() => this.role() === 2)
  readonly isPatientSig = computed(() => this.role() === 3)
  readonly isStaffSig = computed(() => this.role() === 1 || this.role() === 2)

  constructor() {
    this.hydrate()
  }

  private hydrate(): void {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const s = JSON.parse(raw) as PersistedAuth
        this.accessToken.set(s.accessToken ?? null)
        this.refreshToken.set(s.refreshToken ?? null)
        this.fullName.set(s.fullName ?? null)
        this.role.set(s.role ?? null)
      }
    } catch {
      // ignore corrupt storage
    }
    this.hydrated.set(true)
  }

  private persist(): void {
    if (typeof window === 'undefined') return
    const s: PersistedAuth = {
      accessToken: this.accessToken(),
      refreshToken: this.refreshToken(),
      fullName: this.fullName(),
      role: this.role(),
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  }

  setAuth(a: AuthResponse): void {
    this.accessToken.set(a.accessToken)
    this.refreshToken.set(a.refreshToken)
    this.fullName.set(a.fullName)
    this.role.set(a.role)
    this.persist()
  }

  setTokens(accessToken: string, refreshToken: string): void {
    this.accessToken.set(accessToken)
    this.refreshToken.set(refreshToken)
    this.persist()
  }

  logout(): void {
    this.accessToken.set(null)
    this.refreshToken.set(null)
    this.fullName.set(null)
    this.role.set(null)
    this.persist()
  }
}

// Role predicates — mirror the free functions exported from lib/auth.ts.
export const isDoctor = (role: Role | null) => role === 1
export const isReceptionist = (role: Role | null) => role === 2
export const isPatient = (role: Role | null) => role === 3
export const isStaff = (role: Role | null) => role === 1 || role === 2
