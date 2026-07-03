import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { ClinicApi } from '../../core/clinic.api'
import { PageHeaderComponent } from '../../shared/page-header.component'
import { LoadingComponent } from '../../shared/loading.component'

// Port of app/(staff)/prescriptions/page.tsx.
@Component({
  selector: 'app-prescriptions',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PageHeaderComponent,
    LoadingComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <app-page-header title="Prescriptions" subtitle="Active medications tracker" />
      <div class="brand-card brand-card--pad" style="margin-bottom:24px;">
        <mat-form-field appearance="outline" style="min-width:280px;" subscriptSizing="dynamic">
          <mat-label>Patient</mat-label>
          <mat-select [ngModel]="patientId()" (ngModelChange)="patientId.set($event)" name="patient">
            @for (p of patients.data()?.items ?? []; track p.id) {
              <mat-option [value]="p.id">{{ p.fullName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      @if (patientId()) {
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="brand-card brand-card--pad">
            <h2 class="h-section" style="margin-bottom:12px;">Active medications</h2>
            @if (meds.isLoading()) {
              <app-loading />
            } @else if (meds.data()?.length) {
              <div class="stack">
                @for (m of meds.data()!; track m.id) {
                  <div class="soft-surface" style="padding:12px;">
                    <div style="font-weight:600;font-size:14px;">{{ m.medication }} · {{ m.dosage }}</div>
                    <div class="text-secondary" style="font-size:12px;">{{ m.frequency }}</div>
                  </div>
                }
              </div>
            } @else {
              <p class="text-secondary" style="font-size:14px;">No active prescriptions.</p>
            }
          </div>

          <div class="brand-card brand-card--pad">
            <h2 class="h-section" style="margin-bottom:12px;">Add prescription</h2>
            @if (appointmentId(); as apptId) {
              <form (ngSubmit)="add(apptId)">
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
                  <mat-form-field appearance="outline" subscriptSizing="dynamic">
                    <mat-label>Expiry</mat-label>
                    <input matInput type="date" [(ngModel)]="rx.expiryDate" name="expiry" />
                  </mat-form-field>
                  <button mat-flat-button color="primary" type="submit" [disabled]="create.isPending()">Add prescription</button>
                  <p class="text-secondary" style="font-size:12px;margin:0;">Linked to the patient's most recent appointment.</p>
                </div>
              </form>
            } @else {
              <p class="text-secondary" style="font-size:14px;">This patient has no appointment to attach a prescription to.</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .two {
        display: flex;
        gap: 8px;
      }
    `,
  ],
})
export class PrescriptionsComponent {
  private readonly clinic = inject(ClinicApi)

  protected readonly patientId = signal('')
  protected readonly patients = this.clinic.patients(() => ({ search: '', page: 1, bloodType: '' }))
  protected readonly meds = this.clinic.patientPrescriptions(() => this.patientId())
  protected readonly appts = this.clinic.patientAppointments(() => this.patientId())
  protected readonly create = this.clinic.createPrescription()

  protected readonly appointmentId = computed(() => this.appts.data()?.[0]?.id ?? '')
  protected rx = { medication: '', dosage: '', frequency: '', expiryDate: '' }

  protected add(appointmentId: string): void {
    this.create.mutate(
      { appointmentId, ...this.rx, expiryDate: this.rx.expiryDate || undefined },
      { onSuccess: () => (this.rx = { medication: '', dosage: '', frequency: '', expiryDate: '' }) },
    )
  }
}
