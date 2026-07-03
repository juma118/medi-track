import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { PortalApi } from '../../core/portal.api'
import { PageHeaderComponent } from '../../shared/page-header.component'
import { LoadingComponent } from '../../shared/loading.component'
import { BadgeComponent } from '../../shared/badge.component'
import { statusColor } from '../../shared/status'
import { StatusName } from '../../core/models'
import { fmtDateTime } from '../../shared/format'

// Port of app/portal/appointments/page.tsx.
@Component({
  selector: 'app-portal-appointments',
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
      <app-page-header title="My Appointments" subtitle="View upcoming visits and book a new one" />
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="brand-card brand-card--pad lg:col-span-2">
          <h2 class="h-section" style="margin-bottom:12px;">Your appointments</h2>
          @if (appts.isLoading()) {
            <app-loading />
          } @else if (appts.data()?.length) {
            <div class="stack">
              @for (a of appts.data()!; track a.id) {
                <div class="row">
                  <div>
                    <div style="font-weight:600;font-size:14px;">{{ dateTime(a.scheduledAt) }}</div>
                    <div class="text-secondary" style="font-size:12px;">Dr. {{ a.doctorName }} · {{ a.reason ?? 'General' }}</div>
                  </div>
                  <app-badge [color]="statusColor[a.status]">{{ StatusName[a.status] }}</app-badge>
                </div>
              }
            </div>
          } @else {
            <p class="text-secondary" style="font-size:14px;">No appointments yet.</p>
          }
        </div>

        <div class="brand-card brand-card--pad">
          <form (ngSubmit)="book()">
            <h2 class="h-section" style="margin-bottom:12px;">Book an appointment</h2>
            <div class="stack">
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
                <mat-label>Reason for visit</mat-label>
                <input matInput [(ngModel)]="form.reason" name="reason" />
              </mat-form-field>
              <button mat-flat-button color="primary" type="submit" [disabled]="bookMut.isPending()">
                {{ bookMut.isPending() ? 'Booking…' : 'Request appointment' }}
              </button>
              @if (bookMut.isError()) {
                <div class="alert alert--error">Could not book — pick a future time.</div>
              }
              @if (bookMut.isSuccess()) {
                <div class="alert alert--ok">Appointment booked!</div>
              }
            </div>
          </form>
        </div>
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
        border: 1px solid rgba(15, 23, 42, 0.08);
        border-radius: 12px;
        padding: 12px;
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
export class PortalAppointmentsComponent {
  private readonly portal = inject(PortalApi)

  protected readonly appts = this.portal.myAppointments()
  protected readonly doctors = this.portal.portalDoctors()
  protected readonly bookMut = this.portal.selfBook()

  protected readonly statusColor = statusColor
  protected readonly StatusName = StatusName
  protected readonly dateTime = fmtDateTime

  protected form = { doctorId: '', scheduledAt: '', reason: '' }

  protected book(): void {
    this.bookMut.mutate(
      { ...this.form, scheduledAt: new Date(this.form.scheduledAt).toISOString() },
      { onSuccess: () => (this.form = { doctorId: '', scheduledAt: '', reason: '' }) },
    )
  }
}
