import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { QueryClient } from '@tanstack/angular-query-experimental'
import { ClinicApi } from '../../core/clinic.api'
import { AuthService } from '../../core/auth.service'
import { SignalrService } from '../../core/signalr.service'
import { PageHeaderComponent } from '../../shared/page-header.component'
import { LoadingComponent } from '../../shared/loading.component'
import { BadgeComponent } from '../../shared/badge.component'
import { summaryColor } from '../../shared/status'
import { SummaryStatusName } from '../../core/models'
import { fmtDate } from '../../shared/format'
import { AppointmentRowComponent } from './appointment-row.component'
import { MessagingPanelComponent } from './messaging-panel.component'
import { AccountPanelComponent } from './account-panel.component'

// Port of app/(staff)/patients/[id]/page.tsx.
@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeaderComponent,
    LoadingComponent,
    BadgeComponent,
    AppointmentRowComponent,
    MessagingPanelComponent,
    AccountPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (patient.isLoading() || !patient.data()) {
      <app-loading />
    } @else {
      @let p = patient.data()!;
      <div>
        <app-page-header
          [title]="p.fullName"
          [subtitle]="'DOB ' + date(p.dateOfBirth) + ' · ' + (p.bloodType ?? 'Unknown blood type')"
        />

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <!-- Profile -->
          <div class="brand-card brand-card--pad">
            <h2 class="h-section" style="margin-bottom:12px;">Profile</h2>
            <div class="kv"><span class="text-secondary">Email</span><span>{{ p.email || '—' }}</span></div>
            <div class="kv"><span class="text-secondary">Phone</span><span>{{ p.phone || '—' }}</span></div>
            <div class="kv"><span class="text-secondary">Blood type</span><span>{{ p.bloodType || '—' }}</span></div>
            <div class="kv"><span class="text-secondary">History</span><span>{{ p.medicalHistory || '—' }}</span></div>
          </div>

          <!-- Appointments -->
          <div class="brand-card brand-card--pad lg:col-span-2">
            <h2 class="h-section" style="margin-bottom:12px;">Appointments</h2>
            @if (appts.isLoading()) {
              <app-loading />
            } @else if (appts.data()?.length) {
              <div class="stack">
                @for (a of appts.data()!; track a.id) {
                  <app-appointment-row [a]="a" [doctor]="auth.isDoctorSig()" />
                }
              </div>
            } @else {
              <p class="text-secondary" style="font-size:14px;">No appointments.</p>
            }
          </div>

          <!-- Prescriptions -->
          <div class="brand-card brand-card--pad">
            <h2 class="h-section" style="margin-bottom:12px;">Active prescriptions</h2>
            @if (meds.isLoading()) {
              <app-loading />
            } @else if (meds.data()?.length) {
              <div class="stack">
                @for (m of meds.data()!; track m.id) {
                  <div class="soft-surface" style="padding:12px;">
                    <div style="font-weight:600;font-size:14px;">{{ m.medication }} · {{ m.dosage }}</div>
                    <div class="text-secondary" style="font-size:12px;">
                      {{ m.frequency }}{{ m.expiryDate ? ' · exp ' + date(m.expiryDate) : '' }}
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="text-secondary" style="font-size:14px;">No active prescriptions.</p>
            }

            @if (auth.isDoctorSig() && appts.data()?.length) {
              <form style="margin-top:16px;" (ngSubmit)="addPrescription(appts.data()![0].id)">
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
            }
          </div>

          <!-- Records -->
          <div class="brand-card brand-card--pad lg:col-span-2">
            <h2 class="h-section" style="margin-bottom:12px;">Medical records &amp; AI summaries</h2>
            @if (auth.isDoctorSig()) {
              <div class="uploader">
                <input #fileInput type="file" style="font-size:14px;" />
                <button mat-stroked-button [disabled]="upload.isPending()" (click)="doUpload(fileInput)">
                  {{ upload.isPending() ? 'Uploading…' : 'Upload & summarize' }}
                </button>
              </div>
            }
            @if (records.isLoading()) {
              <app-loading />
            } @else if (records.data()?.length) {
              <div class="stack" style="margin-top:16px;">
                @for (r of records.data()!; track r.id) {
                  <div class="outline-surface" style="padding:12px;">
                    <div class="between">
                      <button class="filelink" (click)="openFile(r.id)">📄 {{ r.fileName }}</button>
                      <app-badge [color]="summaryColor[r.summaryStatus]">{{ SummaryStatusName[r.summaryStatus] }}</app-badge>
                    </div>
                    @if (r.aiSummary) {
                      <p class="text-secondary" style="font-size:14px;margin:8px 0 0;white-space:pre-line;">{{ r.aiSummary }}</p>
                    }
                  </div>
                }
              </div>
            } @else {
              <p class="text-secondary" style="font-size:14px;margin-top:16px;">No records uploaded.</p>
            }
          </div>

          <app-messaging-panel [patientId]="id()" />
          @if (auth.isReceptionistSig()) {
            <app-account-panel [patientId]="id()" />
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .kv {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 4px 0;
        font-size: 14px;
      }
      .kv span:last-child {
        text-align: right;
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .two {
        display: flex;
        gap: 8px;
      }
      .between {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .uploader {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .filelink {
        background: none;
        border: none;
        padding: 0;
        color: #0d9488;
        font-weight: 600;
        cursor: pointer;
        font-size: 14px;
      }
      .filelink:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class PatientDetailComponent {
  readonly id = input.required<string>()

  private readonly clinic = inject(ClinicApi)
  protected readonly auth = inject(AuthService)
  private readonly signalr = inject(SignalrService)
  private readonly qc = inject(QueryClient)

  protected readonly patient = this.clinic.patient(() => this.id())
  protected readonly appts = this.clinic.patientAppointments(() => this.id())
  protected readonly meds = this.clinic.patientPrescriptions(() => this.id())
  protected readonly records = this.clinic.patientRecords(() => this.id())
  protected readonly createRx = this.clinic.createPrescription()
  protected readonly upload = this.clinic.uploadRecord()

  protected readonly summaryColor = summaryColor
  protected readonly SummaryStatusName = SummaryStatusName
  protected readonly date = fmtDate
  protected rx = { medication: '', dosage: '', frequency: '' }

  constructor() {
    // Live-refresh records when a summary becomes ready (SignalR), per the React effect.
    effect(() => {
      const pid = this.id()
      if (!pid) return
      this.signalr
        .subscribeToPatient(pid, () => this.qc.invalidateQueries({ queryKey: ['records', pid] }))
        .catch(() => {})
    })
  }

  protected addPrescription(appointmentId: string): void {
    this.createRx.mutate(
      { appointmentId, ...this.rx },
      { onSuccess: () => (this.rx = { medication: '', dosage: '', frequency: '' }) },
    )
  }

  protected doUpload(input: HTMLInputElement): void {
    const file = input.files?.[0]
    if (!file) return
    this.upload.mutate(
      { patientId: this.id(), recordType: 1, file },
      { onSuccess: () => (input.value = '') },
    )
  }

  protected openFile(recordId: string): void {
    void this.clinic.openRecordFile(recordId)
  }
}
