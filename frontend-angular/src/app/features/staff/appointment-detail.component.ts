import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { ClinicApi } from '../../core/clinic.api'
import { AuthService } from '../../core/auth.service'
import { PageHeaderComponent } from '../../shared/page-header.component'
import { LoadingComponent } from '../../shared/loading.component'
import { BadgeComponent } from '../../shared/badge.component'
import { statusColor } from '../../shared/status'
import { StatusName, type AppointmentStatus } from '../../core/models'
import { fmtDateTime } from '../../shared/format'

const statusActions: { status: AppointmentStatus; label: string }[] = [
  { status: 2, label: 'Check in' },
  { status: 3, label: 'Complete' },
  { status: 4, label: 'Cancel' },
  { status: 5, label: 'No show' },
]

// Port of app/(staff)/appointments/[id]/page.tsx.
@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeaderComponent,
    LoadingComponent,
    BadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (appt.isLoading() || !appt.data()) {
      <app-loading />
    } @else {
      @let a = appt.data()!;
      <div>
        <app-page-header title="Appointment" [subtitle]="dateTime(a.scheduledAt)" />
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="brand-card brand-card--pad">
            <div class="between" style="margin-bottom:8px;">
              <span class="plink" (click)="goPatient(a.patientId)">{{ a.patientName }}</span>
              <app-badge [color]="statusColor[a.status]">{{ StatusName[a.status] }}</app-badge>
            </div>
            <div class="text-secondary" style="font-size:14px;">Dr. {{ a.doctorName }}</div>
            <div class="text-secondary" style="font-size:14px;">Reason: {{ a.reason ?? '—' }}</div>
            <div class="actions">
              @for (s of actionsFor(a.status); track s.status) {
                <button mat-stroked-button class="sm" (click)="setStatus.mutate({ id: a.id, status: s.status })">{{ s.label }}</button>
              }
            </div>
            <div style="margin-top:16px;">
              <div class="text-secondary" style="font-size:13px;font-weight:600;">Diagnosis</div>
              <div style="font-size:14px;">{{ a.diagnosis ?? 'Not recorded' }}</div>
              @if (auth.isDoctorSig()) {
                <div class="diag">
                  <mat-form-field appearance="outline" class="grow" subscriptSizing="dynamic">
                    <input matInput placeholder="Record diagnosis" [(ngModel)]="diag" name="diag" />
                  </mat-form-field>
                  <button mat-stroked-button (click)="setDiagnosis.mutate({ id: a.id, diagnosis: diag })">Save</button>
                </div>
              }
            </div>
          </div>

          @if (auth.isDoctorSig()) {
            <div class="brand-card brand-card--pad">
              <h2 class="h-section" style="margin-bottom:12px;">Prescriptions</h2>
              @if (meds.data()?.length) {
                <div class="stack" style="margin-bottom:12px;">
                  @for (m of meds.data()!; track m.id) {
                    <div class="soft-surface" style="padding:8px;font-size:14px;">{{ m.medication }} · {{ m.dosage }} · {{ m.frequency }}</div>
                  }
                </div>
              }
              <form (ngSubmit)="addPrescription(a.id)">
                <div class="stack">
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Medication</mat-label>
                    <input matInput [(ngModel)]="rx.medication" name="med" required />
                  </mat-form-field>
                  <div class="two">
                    <mat-form-field appearance="outline" subscriptSizing="dynamic">
                      <mat-label>Dosage</mat-label>
                      <input matInput [(ngModel)]="rx.dosage" name="dose" required />
                    </mat-form-field>
                    <mat-form-field appearance="outline" subscriptSizing="dynamic">
                      <mat-label>Frequency</mat-label>
                      <input matInput [(ngModel)]="rx.frequency" name="freq" required />
                    </mat-form-field>
                  </div>
                  <button mat-flat-button color="primary" type="submit" [disabled]="createRx.isPending()">Add prescription</button>
                </div>
              </form>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .between {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .plink {
        font-weight: 700;
        color: #0d9488;
        cursor: pointer;
      }
      .plink:hover {
        text-decoration: underline;
      }
      .actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-top: 12px;
      }
      .sm {
        min-height: 32px;
        line-height: 32px;
        font-size: 13px !important;
      }
      .diag {
        display: flex;
        gap: 8px;
        margin-top: 8px;
        align-items: flex-start;
      }
      .grow {
        flex-grow: 1;
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .two {
        display: flex;
        gap: 8px;
      }
    `,
  ],
})
export class AppointmentDetailComponent {
  readonly id = input.required<string>()

  private readonly clinic = inject(ClinicApi)
  protected readonly auth = inject(AuthService)
  private readonly router = inject(Router)

  protected readonly appt = this.clinic.appointment(() => this.id())
  protected readonly meds = this.clinic.patientPrescriptions(() => this.appt.data()?.patientId ?? '')
  protected readonly setStatus = this.clinic.setStatus()
  protected readonly setDiagnosis = this.clinic.setDiagnosis()
  protected readonly createRx = this.clinic.createPrescription()

  protected readonly statusColor = statusColor
  protected readonly StatusName = StatusName
  protected readonly dateTime = fmtDateTime
  protected diag = ''
  protected rx = { medication: '', dosage: '', frequency: '' }

  protected actionsFor(status: AppointmentStatus): { status: AppointmentStatus; label: string }[] {
    return statusActions.filter((s) => s.status !== status)
  }

  protected goPatient(patientId: string): void {
    this.router.navigate(['/patients', patientId])
  }

  protected addPrescription(appointmentId: string): void {
    this.createRx.mutate(
      { appointmentId, ...this.rx },
      { onSuccess: () => (this.rx = { medication: '', dosage: '', frequency: '' }) },
    )
  }
}
