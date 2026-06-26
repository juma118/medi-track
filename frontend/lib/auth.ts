import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AuthResponse, Role } from './types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  fullName: string | null
  role: Role | null
  hydrated: boolean
  setAuth: (a: AuthResponse) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
}

// SSR-safe storage: no-op on the server, localStorage in the browser.
const storage = createJSONStorage(() =>
  typeof window !== 'undefined'
    ? window.localStorage
    : { getItem: () => null, setItem: () => {}, removeItem: () => {} },
)

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      fullName: null,
      role: null,
      hydrated: false,
      setAuth: (a) =>
        set({ accessToken: a.accessToken, refreshToken: a.refreshToken, fullName: a.fullName, role: a.role }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      logout: () => set({ accessToken: null, refreshToken: null, fullName: null, role: null }),
    }),
    {
      name: 'meditrack-auth',
      storage,
      onRehydrateStorage: () => (state) => state && (state.hydrated = true),
    },
  ),
)

export const isDoctor = (role: Role | null) => role === 1
export const isReceptionist = (role: Role | null) => role === 2
export const isPatient = (role: Role | null) => role === 3
export const isStaff = (role: Role | null) => role === 1 || role === 2
