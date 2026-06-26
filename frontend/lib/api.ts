import axios from 'axios'
import { useAuth } from './auth'

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5293'

export const api = axios.create({ baseURL: `${API_BASE}/api` })

api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing: Promise<string | null> | null = null

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    const status = error.response?.status
    if (status === 401 && original && !original._retry) {
      original._retry = true
      const newToken = await tryRefresh()
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      }
      useAuth.getState().logout()
    }
    return Promise.reject(error)
  },
)

async function tryRefresh(): Promise<string | null> {
  const { refreshToken, setTokens } = useAuth.getState()
  if (!refreshToken) return null
  if (!refreshing) {
    refreshing = axios
      .post(`${API_BASE}/api/auth/refresh`, { refreshToken })
      .then((res) => {
        setTokens(res.data.accessToken, res.data.refreshToken)
        return res.data.accessToken as string
      })
      .catch(() => null)
      .finally(() => {
        refreshing = null
      })
  }
  return refreshing
}
