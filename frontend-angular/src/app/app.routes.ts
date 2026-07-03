import { Routes } from '@angular/router'
import { portalGuard, staffGuard } from './core/guards'

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent),
  },

  // ---- Staff area (doctor / receptionist) ----
  {
    path: '',
    canActivate: [staffGuard],
    loadComponent: () =>
      import('./features/staff/staff-layout.component').then((m) => m.StaffLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/staff/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'patients',
        loadComponent: () =>
          import('./features/staff/patients-list.component').then((m) => m.PatientsListComponent),
      },
      {
        path: 'patients/:id',
        loadComponent: () =>
          import('./features/staff/patient-detail.component').then((m) => m.PatientDetailComponent),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/staff/appointments-list.component').then((m) => m.AppointmentsListComponent),
      },
      {
        path: 'appointments/:id',
        loadComponent: () =>
          import('./features/staff/appointment-detail.component').then((m) => m.AppointmentDetailComponent),
      },
      {
        path: 'records',
        loadComponent: () =>
          import('./features/staff/records.component').then((m) => m.RecordsComponent),
      },
      {
        path: 'prescriptions',
        loadComponent: () =>
          import('./features/staff/prescriptions.component').then((m) => m.PrescriptionsComponent),
      },
      {
        path: 'refill-requests',
        loadComponent: () =>
          import('./features/staff/refill-requests.component').then((m) => m.RefillRequestsComponent),
      },
      {
        path: 'ai',
        loadComponent: () => import('./features/staff/ai.component').then((m) => m.AiComponent),
      },
    ],
  },

  // ---- Patient portal ----
  {
    path: 'portal',
    canActivate: [portalGuard],
    loadComponent: () =>
      import('./features/portal/portal-layout.component').then((m) => m.PortalLayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/portal/portal-home.component').then((m) => m.PortalHomeComponent),
      },
      {
        path: 'appointments',
        loadComponent: () =>
          import('./features/portal/portal-appointments.component').then((m) => m.PortalAppointmentsComponent),
      },
      {
        path: 'prescriptions',
        loadComponent: () =>
          import('./features/portal/portal-prescriptions.component').then((m) => m.PortalPrescriptionsComponent),
      },
      {
        path: 'records',
        loadComponent: () =>
          import('./features/portal/portal-records.component').then((m) => m.PortalRecordsComponent),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./features/portal/portal-messages.component').then((m) => m.PortalMessagesComponent),
      },
    ],
  },

  { path: '**', redirectTo: '' },
]
