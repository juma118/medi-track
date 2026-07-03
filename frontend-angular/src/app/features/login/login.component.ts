import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { ClinicApi } from '../../core/clinic.api'
import { AuthService, isPatient } from '../../core/auth.service'
import type { AuthResponse } from '../../core/models'

interface Demo {
  label: string
  email: string
  password: string
}

// Port of app/login/page.tsx.
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wrap">
      <div class="card brand-card">
        <div class="head">
          <div class="logo"><mat-icon>local_hospital</mat-icon></div>
          <h1 style="font-size:1.4rem;font-weight:700;margin:0;">MediTrack</h1>
          <p class="text-secondary" style="margin:0;font-size:14px;">Sign in to continue</p>
        </div>

        <form (ngSubmit)="submit()">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Email</mat-label>
            <input matInput type="email" name="email" [(ngModel)]="email" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Password</mat-label>
            <input matInput type="password" name="password" [(ngModel)]="password" required />
          </mat-form-field>

          @if (login.isError()) {
            <div class="alert alert--error">Invalid email or password.</div>
          }

          <button mat-flat-button color="primary" class="full btn-lg" type="submit" [disabled]="login.isPending()">
            {{ login.isPending() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <div class="sep"><span>Demo accounts</span></div>
        <div class="demos">
          @for (d of demos; track d.email) {
            <button type="button" class="demo-chip" (click)="fill(d)">{{ d.label }}</button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .wrap {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 16px;
        background: linear-gradient(160deg, #0f766e, #4f46e5);
      }
      .card {
        width: 100%;
        max-width: 420px;
        padding: 32px;
      }
      .head {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        margin-bottom: 24px;
      }
      .logo {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #0d9488;
        color: #fff;
        display: grid;
        place-items: center;
      }
      .full {
        width: 100%;
      }
      .btn-lg {
        height: 44px;
      }
      .alert {
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 14px;
        margin-bottom: 12px;
      }
      .alert--error {
        background: #ffe4e6;
        color: #be123c;
      }
      .sep {
        display: flex;
        align-items: center;
        text-align: center;
        color: #94a3b8;
        font-size: 13px;
        margin: 24px 0 16px;
      }
      .sep::before,
      .sep::after {
        content: '';
        flex: 1;
        height: 1px;
        background: rgba(15, 23, 42, 0.1);
      }
      .sep span {
        padding: 0 12px;
      }
      .demos {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .demo-chip {
        border: 1px solid rgba(15, 23, 42, 0.2);
        background: #fff;
        border-radius: 999px;
        padding: 6px 16px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }
      .demo-chip:hover {
        border-color: #0d9488;
        color: #0f766e;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly clinic = inject(ClinicApi)
  private readonly auth = inject(AuthService)
  private readonly router = inject(Router)

  protected readonly login = this.clinic.login()
  protected email = 'doctor@meditrack.dev'
  protected password = 'Doctor123!'

  protected readonly demos: Demo[] = [
    { label: 'Doctor', email: 'doctor@meditrack.dev', password: 'Doctor123!' },
    { label: 'Receptionist', email: 'reception@meditrack.dev', password: 'Reception123!' },
    { label: 'Patient', email: 'patient@meditrack.dev', password: 'Patient123!' },
  ]

  constructor() {
    // If already signed in, bounce to the right home (app/login/page.tsx effect).
    if (this.auth.accessToken()) {
      this.router.navigateByUrl(isPatient(this.auth.role()) ? '/portal' : '/dashboard')
    }
  }

  protected fill(d: Demo): void {
    this.email = d.email
    this.password = d.password
  }

  protected submit(): void {
    this.login.mutate(
      { email: this.email, password: this.password },
      {
        onSuccess: (data: AuthResponse) =>
          this.router.navigateByUrl(isPatient(data.role) ? '/portal' : '/dashboard'),
      },
    )
  }
}
