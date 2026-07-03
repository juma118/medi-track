import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { ClinicApi } from '../../core/clinic.api'
import { AuthService } from '../../core/auth.service'
import { PageHeaderComponent } from '../../shared/page-header.component'
import { LoadingComponent } from '../../shared/loading.component'
import { BadgeComponent } from '../../shared/badge.component'
import { fmtDate } from '../../shared/format'

// Port of app/(staff)/patients/page.tsx (list + inline "new patient" form).
@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    PageHeaderComponent,
    LoadingComponent,
    BadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <app-page-header title="Patients" subtitle="Search and manage patient records">
        @if (auth.isReceptionistSig()) {
          <button mat-flat-button color="primary" (click)="showForm.set(!showForm())">
            <mat-icon>add</mat-icon> New patient
          </button>
        }
      </app-page-header>

      @if (showForm()) {
        <div class="brand-card brand-card--pad" style="margin-bottom:16px;">
          <form (ngSubmit)="createPatient()">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <mat-form-field appearance="outline">
                <mat-label>Full name</mat-label>
                <input matInput [(ngModel)]="form.fullName" name="fullName" required />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Date of birth</mat-label>
                <input matInput type="date" [(ngModel)]="form.dateOfBirth" name="dob" required />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Blood type</mat-label>
                <input matInput [(ngModel)]="form.bloodType" name="blood" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Phone</mat-label>
                <input matInput [(ngModel)]="form.phone" name="phone" />
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" [(ngModel)]="form.email" name="email" />
              </mat-form-field>
              <div class="form-actions">
                <button mat-flat-button color="primary" type="submit" [disabled]="create.isPending()">Save</button>
                <button mat-button type="button" (click)="showForm.set(false)">Cancel</button>
              </div>
            </div>
            @if (create.isError()) {
              <p style="color:#be123c;font-size:14px;margin-top:8px;">Could not create patient. Check the fields.</p>
            }
          </form>
        </div>
      }

      <div class="filters">
        <mat-form-field appearance="outline" class="grow">
          <mat-label>Search name, email, phone…</mat-label>
          <input matInput [ngModel]="search()" (ngModelChange)="onSearch($event)" name="search" />
        </mat-form-field>
        <mat-form-field appearance="outline" style="min-width:180px;">
          <mat-label>Blood type</mat-label>
          <mat-select [ngModel]="blood()" (ngModelChange)="onBlood($event)" name="bloodFilter">
            @for (b of bloodTypes; track b) {
              <mat-option [value]="b">{{ b || 'All blood types' }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <div class="brand-card">
        @if (query.isLoading()) {
          <app-loading />
        } @else {
          <table class="tbl">
            <thead>
              <tr><th>Name</th><th>DOB</th><th>Blood</th><th>Contact</th></tr>
            </thead>
            <tbody>
              @for (p of query.data()?.items ?? []; track p.id) {
                <tr class="rowlink" (click)="open(p.id)">
                  <td style="font-weight:600;">{{ p.fullName }}</td>
                  <td>{{ date(p.dateOfBirth) }}</td>
                  <td>
                    @if (p.bloodType) {
                      <app-badge color="error" [outlined]="true">{{ p.bloodType }}</app-badge>
                    }
                  </td>
                  <td class="text-secondary">{{ p.email ?? p.phone ?? '—' }}</td>
                </tr>
              }
              @if ((query.data()?.items?.length ?? 0) === 0) {
                <tr><td colspan="4" style="text-align:center;padding:40px;" class="text-secondary">No patients found.</td></tr>
              }
            </tbody>
          </table>
        }
      </div>

      @if (query.data(); as d) {
        @if (d.totalPages > 1) {
          <div class="pager">
            <button mat-stroked-button [disabled]="page() <= 1" (click)="page.set(page() - 1)">Prev</button>
            <span class="text-secondary" style="font-size:14px;">Page {{ d.page }} of {{ d.totalPages }}</span>
            <button mat-stroked-button [disabled]="page() >= d.totalPages" (click)="page.set(page() + 1)">Next</button>
          </div>
        }
      }
    </div>
  `,
  styles: [
    `
      .filters {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 16px;
      }
      .grow {
        flex-grow: 1;
        min-width: 280px;
      }
      .form-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .tbl {
        width: 100%;
        border-collapse: collapse;
      }
      .tbl th {
        text-align: left;
        font-size: 13px;
        color: #64748b;
        font-weight: 600;
        padding: 14px 16px;
        border-bottom: 1px solid rgba(15, 23, 42, 0.08);
      }
      .tbl td {
        padding: 14px 16px;
        border-bottom: 1px solid rgba(15, 23, 42, 0.05);
        font-size: 14px;
      }
      .rowlink {
        cursor: pointer;
      }
      .rowlink:hover {
        background: rgba(15, 23, 42, 0.03);
      }
      .pager {
        display: flex;
        gap: 16px;
        align-items: center;
        margin-top: 16px;
      }
    `,
  ],
})
export class PatientsListComponent {
  private readonly clinic = inject(ClinicApi)
  protected readonly auth = inject(AuthService)
  private readonly router = inject(Router)

  protected readonly search = signal('')
  protected readonly blood = signal('')
  protected readonly page = signal(1)
  protected readonly showForm = signal(false)

  protected readonly date = fmtDate
  protected readonly bloodTypes = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  protected form = { fullName: '', dateOfBirth: '', bloodType: '', phone: '', email: '' }

  protected readonly query = this.clinic.patients(() => ({
    search: this.search(),
    page: this.page(),
    bloodType: this.blood(),
  }))
  protected readonly create = this.clinic.createPatient()

  protected onSearch(v: string): void {
    this.search.set(v)
    this.page.set(1)
  }
  protected onBlood(v: string): void {
    this.blood.set(v)
    this.page.set(1)
  }

  protected open(id: string): void {
    this.router.navigate(['/patients', id])
  }

  protected createPatient(): void {
    this.create.mutate(this.form, {
      onSuccess: () => {
        this.showForm.set(false)
        this.form = { fullName: '', dateOfBirth: '', bloodType: '', phone: '', email: '' }
      },
    })
  }
}
