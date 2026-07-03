import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { AuthService, isPatient } from './auth.service'

// Port of the redirect logic in app/(staff)/layout.tsx.
export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)
  if (!auth.accessToken()) return router.parseUrl('/login')
  if (isPatient(auth.role())) return router.parseUrl('/portal')
  return true
}

// Port of the redirect logic in app/portal/layout.tsx.
export const portalGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)
  if (!auth.accessToken()) return router.parseUrl('/login')
  if (!isPatient(auth.role())) return router.parseUrl('/dashboard')
  return true
}
