import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { firstValueFrom } from 'rxjs'
import { API_URL } from './api'

type Params = Record<string, string | number | boolean>

/**
 * Thin promise-returning wrapper over HttpClient so query/mutation functions
 * read like the Axios calls in lib/api.ts. Auth headers & refresh are handled
 * by the functional interceptor.
 */
@Injectable({ providedIn: 'root' })
export class HttpApi {
  private readonly http = inject(HttpClient)

  get<T>(url: string, params?: Params): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${API_URL}${url}`, { params }))
  }

  post<T>(url: string, body?: unknown): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${API_URL}${url}`, body ?? {}))
  }

  put<T>(url: string, body?: unknown): Promise<T> {
    return firstValueFrom(this.http.put<T>(`${API_URL}${url}`, body ?? {}))
  }

  postForm<T>(url: string, form: FormData): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${API_URL}${url}`, form))
  }

  async openFile(url: string): Promise<void> {
    const blob = await firstValueFrom(this.http.get(`${API_URL}${url}`, { responseType: 'blob' }))
    const objectUrl = URL.createObjectURL(blob)
    window.open(objectUrl, '_blank')
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
  }
}
