import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { ClinicApi } from '../../core/clinic.api'
import { AuthService } from '../../core/auth.service'
import { PageHeaderComponent } from '../../shared/page-header.component'
import { LoadingComponent } from '../../shared/loading.component'
import { BadgeComponent } from '../../shared/badge.component'
import { statusColor } from '../../shared/status'
import { StatusName } from '../../core/models'
import { fmtTime } from '../../shared/format'

// Port of app/(staff)/appointments/page.tsx.
@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PageHeaderComponent,
    LoadingComponent,
    BadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <app-page-header title="Appointments" subtitle="Today's schedule and booking" />
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="brand-card brand-card--pad lg:col-span-2">
          <h2 class="h-section" style="margin-bottom:16px;">Today</h2>
          @if (today.isLoading()) {
            <app-loading />
          } @else if (today.data()?.length) {
            <div class="stack">
              @for (a of today.data()!; track a.id) {
                <div class="row" (click)="open(a.id)">
                  <div>
                    <div style="font-weight:600;font-size:14px;">{{ a.patientName }}</div>
                    <div class="text-secondary" style="font-size:12px;">
                      {{ time(a.scheduledAt) }} · Dr. {{ a.doctorName }}{{ a.reason ? ' · ' + a.reason : '' }}
                    </div>
                  </div>
                  <app-badge [color]="statusColor[a.status]">{{ StatusName[a.status] }}</app-badge>
                </div>
              }
            </div>
          } @else {
            <p class="text-secondary" style="font-size:14px;">No appointments scheduled today.</p>
          }
        </div>

        @if (auth.isReceptionistSig()) {
          <div class="brand-card brand-card--pad">
            <form (ngSubmit)="book()">
              <h2 class="h-section" style="margin-bottom:16px;">Book appointment</h2>
              <div class="stack">
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Patient</mat-label>
                  <mat-select [(ngModel)]="form.patientId" name="patient" required>
                    @for (p of patients.data()?.items ?? []; track p.id) {
                      <mat-option [value]="p.id">{{ p.fullName }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Doctor</mat-label>
                  <mat-select [(ngModel)]="form.doctorId" name="doctor" required>
                    @for (d of doctors.data() ?? []; track d.id) {
                      <mat-option [value]="d.id">{{ d.fullName }} — {{ d.specialty }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>When</mat-label>
                  <input matInput type="datetime-local" [(ngModel)]="form.scheduledAt" name="when" required />
                </mat-form-field>
                <mat-form-field appearance="outline" subscriptSizing="dynamic">
                  <mat-label>Reason</mat-label>
                  <input matInput [(ngModel)]="form.reason" name="reason" />
                </mat-form-field>
                <button mat-flat-button color="primary" type="submit" [disabled]="create.isPending()">
                  {{ create.isPending() ? 'Booking…' : 'Book' }}
                </button>
                @if (create.isError()) {
                  <div class="alert alert--error">Could not book. Pick a future time.</div>
                }
                @if (create.isSuccess()) {
                  <div class="alert alert--ok">Appointment booked.</div>
                }
              </div>
            </form>
          </div>
        } @else {
          <div class="brand-card brand-card--pad">
            <p class="text-secondary" style="font-size:14px;">Only receptionists can book appointments.</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 12px;
        padding: 12px;
      }
      .row:hover {
        background: rgba(15, 23, 42, 0.03);
      }
      .alert {
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 14px;
      }
      .alert--error {
        background: #ffe4e6;
        color: #be123c;
      }
      .alert--ok {
        background: #d1fae5;
        color: #047857;
      }
    `,
  ],
})
export class AppointmentsListComponent {
  private readonly clinic = inject(ClinicApi)
  protected readonly auth = inject(AuthService)
  private readonly router = inject(Router)

  protected readonly today = this.clinic.todayAppointments()
  protected readonly patients = this.clinic.patients(() => ({ search: '', page: 1, bloodType: '' }))
  protected readonly doctors = this.clinic.doctors()
  protected readonly create = this.clinic.createAppointment()

  protected readonly statusColor = statusColor
  protected readonly StatusName = StatusName
  protected readonly time = fmtTime

  protected form = { patientId: '', doctorId: '', scheduledAt: '', reason: '' }

  protected open(id: string): void {
    this.router.navigate(['/appointments', id])
  }

  protected book(): void {
    this.create.mutate(
      { ...this.form, scheduledAt: new Date(this.form.scheduledAt).toISOString() },
      { onSuccess: () => (this.form = { patientId: '', doctorId: '', scheduledAt: '', reason: '' }) },
    )
  }
}
