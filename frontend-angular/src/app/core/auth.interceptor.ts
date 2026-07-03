import { HttpClient, HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http'
import { inject } from '@angular/core'
import { Observable, catchError, finalize, map, of, shareReplay, switchMap, throwError } from 'rxjs'
import { AuthService } from './auth.service'
import { API_BASE } from './api'
import type { AuthResponse } from './models'

// Marks a request that has already been retried after a token refresh, so a
// second 401 doesn't trigger an endless refresh loop.
const RETRIED = new HttpContextToken<boolean>(() => false)

// Shared in-flight refresh — concurrent 401s all await the same call, matching
// the `refreshing` promise in lib/api.ts.
let refresh$: Observable<string | null> | null = null

/**
 * Port of the Axios request/response interceptors in lib/api.ts:
 *  - attaches the bearer token to every API request
 *  - on 401, transparently refreshes the token once and retries
 *  - on refresh failure, logs the user out
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService)
  const http = inject(HttpClient)

  const isRefreshCall = req.url.includes('/auth/refresh')
  const token = auth.accessToken()
  const authReq =
    token && !isRefreshCall ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const alreadyRetried = req.context.get(RETRIED)
      if (err.status === 401 && !isRefreshCall && !alreadyRetried) {
        return tryRefresh(auth, http).pipe(
          switchMap((newToken) => {
            if (newToken) {
              const retried = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
                context: req.context.set(RETRIED, true),
              })
              return next(retried)
            }
            auth.logout()
            return throwError(() => err)
          }),
        )
      }
      return throwError(() => err)
    }),
  )
}

function tryRefresh(auth: AuthService, http: HttpClient): Observable<string | null> {
  const refreshToken = auth.refreshToken()
  if (!refreshToken) return of(null)
  if (!refresh$) {
    refresh$ = http.post<AuthResponse>(`${API_BASE}/api/auth/refresh`, { refreshToken }).pipe(
      map((res) => {
        auth.setTokens(res.accessToken, res.refreshToken)
        return res.accessToken
      }),
      catchError(() => of(null)),
      finalize(() => {
        refresh$ = null
      }),
      shareReplay(1),
    )
  }
  return refresh$
}
