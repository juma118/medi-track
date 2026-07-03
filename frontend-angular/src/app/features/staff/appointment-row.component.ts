import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { ClinicApi } from '../../core/clinic.api'
import { BadgeComponent } from '../../shared/badge.component'
import { statusColor } from '../../shared/status'
import { StatusName, type Appointment, type AppointmentStatus } from '../../core/models'
import { fmtDateTime } from '../../shared/format'

const statusActions: { status: AppointmentStatus; label: string }[] = [
  { status: 2, label: 'Check in' },
  { status: 3, label: 'Complete' },
  { status: 4, label: 'Cancel' },
  { status: 5, label: 'No show' },
]

// Port of the AppointmentRow sub-component in patients/[id]/page.tsx.
@Component({
  selector: 'app-appointment-row',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="outline-surface" style="padding:12px;">
      <div class="between">
        <span style="font-weight:600;font-size:14px;">{{ dateTime(a.scheduledAt) }}</span>
        <app-badge [color]="statusColor[a.status]">{{ StatusName[a.status] }}</app-badge>
      </div>
      <div class="text-secondary" style="font-size:14px;">Dr. {{ a.doctorName }} · {{ a.reason ?? 'No reason' }}</div>
      @if (a.diagnosis) {
        <div style="font-size:14px;margin-top:4px;">Diagnosis: {{ a.diagnosis }}</div>
      }
      <div class="actions">
        @for (s of visibleActions(); track s.status) {
          <button mat-stroked-button class="sm" (click)="setStatus.mutate({ id: a.id, status: s.status })">{{ s.label }}</button>
        }
      </div>
      @if (doctor) {
        <div class="diag">
          <mat-form-field appearance="outline" class="grow" subscriptSizing="dynamic">
            <input matInput placeholder="Diagnosis" [(ngModel)]="diag" name="diag" />
          </mat-form-field>
          <button mat-stroked-button (click)="setDiagnosis.mutate({ id: a.id, diagnosis: diag })">Save</button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .between {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .actions {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        margin-top: 8px;
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
    `,
  ],
})
export class AppointmentRowComponent implements OnInit {
  @Input({ required: true }) a!: Appointment
  @Input() doctor = false

  private readonly clinic = inject(ClinicApi)
  protected readonly setStatus = this.clinic.setStatus()
  protected readonly setDiagnosis = this.clinic.setDiagnosis()

  protected readonly StatusName = StatusName
  protected readonly statusColor = statusColor
  protected readonly dateTime = fmtDateTime
  protected diag = ''

  ngOnInit(): void {
    this.diag = this.a.diagnosis ?? ''
  }

  protected visibleActions(): { status: AppointmentStatus; label: string }[] {
    return statusActions.filter((s) => s.status !== this.a.status)
  }
}
