import { environment } from '@env/environment'

// Mirror of lib/api.ts constants.
export const API_BASE = environment.apiUrl
export const API_URL = `${API_BASE}/api`
