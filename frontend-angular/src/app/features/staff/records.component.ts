import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatSelectModule } from '@angular/material/select'
import { QueryClient } from '@tanstack/angular-query-experimental'
import { ClinicApi } from '../../core/clinic.api'
import { SignalrService } from '../../core/signalr.service'
import { PageHeaderComponent } from '../../shared/page-header.component'
import { LoadingComponent } from '../../shared/loading.component'
import { BadgeComponent } from '../../shared/badge.component'
import { summaryColor } from '../../shared/status'
import { SummaryStatusName } from '../../core/models'

// Port of app/(staff)/records/page.tsx.
@Component({
  selector: 'app-records',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    PageHeaderComponent,
    LoadingComponent,
    BadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <app-page-header title="Medical Records" subtitle="Upload documents and view AI summaries" />
      <div class="brand-card brand-card--pad" style="margin-bottom:24px;">
        <mat-form-field appearance="outline" style="min-width:280px;" subscriptSizing="dynamic">
          <mat-label>Patient</mat-label>
          <mat-select [ngModel]="patientId()" (ngModelChange)="patientId.set($event)" name="patient">
            @for (p of patients.data()?.items ?? []; track p.id) {
              <mat-option [value]="p.id">{{ p.fullName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        @if (patientId()) {
          <div class="uploader">
            <input #fileInput type="file" style="font-size:14px;" />
            <button mat-flat-button color="primary" [disabled]="upload.isPending()" (click)="doUpload(fileInput)">
              {{ upload.isPending() ? 'Uploading…' : 'Upload & summarize' }}
            </button>
          </div>
        }
      </div>

      @if (patientId()) {
        <div class="brand-card brand-card--pad">
          <h2 class="h-section" style="margin-bottom:12px;">Records</h2>
          @if (records.isLoading()) {
            <app-loading />
          } @else if (records.data()?.length) {
            <div class="stack">
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
            <p class="text-secondary" style="font-size:14px;">No records for this patient.</p>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .uploader {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-top: 16px;
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .between {
        display: flex;
        justify-content: space-between;
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
export class RecordsComponent {
  private readonly clinic = inject(ClinicApi)
  private readonly signalr = inject(SignalrService)
  private readonly qc = inject(QueryClient)

  protected readonly patientId = signal('')
  protected readonly patients = this.clinic.patients(() => ({ search: '', page: 1, bloodType: '' }))
  protected readonly records = this.clinic.patientRecords(() => this.patientId())
  protected readonly upload = this.clinic.uploadRecord()

  protected readonly summaryColor = summaryColor
  protected readonly SummaryStatusName = SummaryStatusName

  constructor() {
    effect(() => {
      const pid = this.patientId()
      if (!pid) return
      this.signalr
        .subscribeToPatient(pid, () => this.qc.invalidateQueries({ queryKey: ['records', pid] }))
        .catch(() => {})
    })
  }

  protected doUpload(input: HTMLInputElement): void {
    const file = input.files?.[0]
    if (!file) return
    this.upload.mutate(
      { patientId: this.patientId(), recordType: 1, file },
      { onSuccess: () => (input.value = '') },
    )
  }

  protected openFile(recordId: string): void {
    void this.clinic.openRecordFile(recordId)
  }
}
