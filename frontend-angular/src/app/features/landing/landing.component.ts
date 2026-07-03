import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { AuthService, isPatient } from '../../core/auth.service'

interface RoleCard {
  icon: string
  title: string
  color: string
  points: string[]
}
interface Feature {
  icon: string
  title: string
  desc: string
}

// Port of app/page.tsx — the marketing landing page.
@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <!-- Top bar -->
      <header class="appbar">
        <div class="container bar-inner">
          <div class="brand-link" (click)="go('/')" role="link" tabindex="0" (keydown.enter)="go('/')">
            <div class="logo"><mat-icon>local_hospital</mat-icon></div>
            <div class="brand">MediTrack</div>
          </div>
          @if (loggedIn()) {
            <span class="hi">Hi, {{ firstName() }}</span>
            <button mat-flat-button class="btn-white" (click)="goToApp()">
              Open app <mat-icon iconPositionEnd>arrow_forward</mat-icon>
            </button>
          } @else {
            <button mat-flat-button class="btn-white" (click)="go('/login')">Sign in</button>
          }
        </div>
      </header>

      <!-- Hero -->
      <section class="hero">
        <div class="hero-glow"></div>
        <div class="container hero-grid">
          <div>
            <span class="pill">AI Powered · HealthTech Platform</span>
            <h1 class="hero-title">Caring for patients, doctors &amp; clinics — together.</h1>
            <p class="hero-sub">
              Manage patients, appointments, records and prescriptions — with an AI assistant and a
              warm, self-service patient portal.
            </p>
            <div class="hero-actions">
              @if (loggedIn()) {
                <button mat-flat-button class="btn-white btn-lg" (click)="goToApp()">
                  Go to your {{ isPatientRole() ? 'portal' : 'dashboard' }}
                  <mat-icon iconPositionEnd>arrow_forward</mat-icon>
                </button>
              } @else {
                <button mat-flat-button class="btn-white btn-lg" (click)="go('/login')">
                  Sign in <mat-icon iconPositionEnd>arrow_forward</mat-icon>
                </button>
                <a mat-stroked-button class="btn-ghost btn-lg" href="#roles">Explore roles</a>
              }
            </div>
          </div>

          <div class="hero-art">
            <div class="hero-image"></div>
            <div class="hero-card">
              <div class="hero-card-icon"><mat-icon>smart_toy</mat-icon></div>
              <div>
                <div class="hero-card-title">AI summaries</div>
                <div class="hero-card-sub">in seconds, not minutes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Feature strip -->
      <section class="container section">
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          @for (f of features; track f.title) {
            <div class="brand-card brand-card--pad feature">
              <div class="feature-icon"><mat-icon>{{ f.icon }}</mat-icon></div>
              <h3 class="h-section">{{ f.title }}</h3>
              <p class="text-secondary" style="font-size:14px;margin:6px 0 0;">{{ f.desc }}</p>
            </div>
          }
        </div>
      </section>

      <!-- Roles -->
      <section id="roles" class="roles-band">
        <div class="container section">
          <div style="text-align:center;margin-bottom:48px;">
            <h2 style="font-size:2rem;font-weight:800;margin:0 0 8px;">Built for everyone in the clinic</h2>
            <p class="text-secondary" style="max-width:560px;margin:0 auto;">
              A tailored experience per role — patients get self-service, staff get the tools they need.
            </p>
          </div>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
            @for (r of roles; track r.title) {
              <div class="brand-card role-card">
                <div class="role-accent" [style.background]="r.color"></div>
                <div style="padding:24px;">
                  <div class="role-icon" [style.background]="r.color"><mat-icon>{{ r.icon }}</mat-icon></div>
                  <h3 style="font-size:1.3rem;font-weight:700;margin:0 0 12px;">{{ r.title }}</h3>
                  @for (p of r.points; track p) {
                    <div class="role-point">
                      <span class="dot" [style.background]="r.color"></span>
                      <span class="text-secondary" style="font-size:14px;">{{ p }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="container section">
        <div class="cta">
          <h2 style="font-size:1.9rem;font-weight:700;margin:0 0 8px;">Ready to get started?</h2>
          <p style="opacity:.8;margin:0 0 24px;">Sign in with a demo account to explore the full platform.</p>
          <button mat-flat-button color="primary" class="btn-lg" (click)="goToApp()">
            {{ loggedIn() ? 'Open the app' : 'Sign in' }}
          </button>
          <p style="margin-top:24px;opacity:.6;font-size:12px;">
            Demo: doctor&#64;meditrack.dev · reception&#64;meditrack.dev · patient&#64;meditrack.dev
          </p>
        </div>
      </section>

      <footer class="footer text-secondary">
        MediTrack — MVP demo · synthetic data only
      </footer>
    </div>
  `,
  styleUrl: './landing.component.scss',
})
export class LandingComponent {
  private readonly auth = inject(AuthService)
  private readonly router = inject(Router)

  protected readonly loggedIn = computed(() => !!this.auth.accessToken())
  protected readonly isPatientRole = computed(() => isPatient(this.auth.role()))
  protected readonly firstName = computed(() => this.auth.fullName()?.split(' ')[0] ?? '')

  protected readonly features: Feature[] = [
    { icon: 'smart_toy', title: 'AI assistant', desc: 'Symptom analysis, document summarization, and grounded patient-history chat.' },
    { icon: 'bolt', title: 'Event-driven', desc: 'Kafka-backed workers handle AI, notifications, and audit asynchronously.' },
    { icon: 'insights', title: 'Live dashboard', desc: 'Redis-cached KPIs and real-time updates over SignalR.' },
    { icon: 'shield', title: 'Role-based access', desc: 'Scoped, audited access for doctors, receptionists, and patients.' },
  ]

  protected readonly roles: RoleCard[] = [
    { icon: 'person', title: 'Patients', color: '#0d9488', points: ['Book & track appointments', 'View records and AI summaries', 'Request prescription refills', 'Message your care team'] },
    { icon: 'medical_services', title: 'Doctors', color: '#4f46e5', points: ['Diagnoses & prescriptions', 'AI symptom analysis', 'Patient-history chat (RAG)', 'Review refill requests'] },
    { icon: 'support_agent', title: 'Receptionists', color: '#0284c7', points: ['Register & search patients', 'Book appointments', 'Provision portal accounts', 'Daily schedule overview'] },
  ]

  protected go(path: string): void {
    this.router.navigateByUrl(path)
  }

  protected goToApp(): void {
    if (!this.loggedIn()) {
      this.router.navigateByUrl('/login')
      return
    }
    this.router.navigateByUrl(isPatient(this.auth.role()) ? '/portal' : '/dashboard')
  }
}
