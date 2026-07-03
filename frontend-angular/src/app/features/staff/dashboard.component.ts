import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { Router } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { ClinicApi } from '../../core/clinic.api'
import { PageHeaderComponent } from '../../shared/page-header.component'
import { LoadingComponent } from '../../shared/loading.component'
import { BadgeComponent } from '../../shared/badge.component'
import { BarChartComponent } from '../../shared/bar-chart.component'
import { statusColor } from '../../shared/status'
import { StatusName, type DashboardStats } from '../../core/models'
import { fmtTime, fmtWeekday } from '../../shared/format'

type TileKey = keyof Pick<
  DashboardStats,
  'totalPatients' | 'todaysAppointments' | 'pendingAppointments' | 'activePrescriptions' | 'newPatientsThisMonth'
>

// Port of app/(staff)/dashboard/page.tsx.
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, PageHeaderComponent, LoadingComponent, BadgeComponent, BarChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (dash.isLoading() || !dash.data(); as _loading) {
      <app-loading />
    } @else {
      @let d = dash.data()!;
      <div>
        <app-page-header title="Dashboard" subtitle="Clinic overview at a glance" />

        <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
          @for (t of tiles; track t.key) {
            <div class="brand-card brand-card--pad">
              <div class="tile-icon" [style.background]="t.color + '1a'" [style.color]="t.color">
                <mat-icon>{{ t.icon }}</mat-icon>
              </div>
              <div style="font-size:1.9rem;font-weight:700;">{{ d[t.key] }}</div>
              <div class="text-secondary" style="font-size:14px;">{{ t.label }}</div>
            </div>
          }
        </div>

        <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div class="brand-card brand-card--pad lg:col-span-2">
            <h2 class="h-section" style="margin-bottom:16px;">Appointments — last 7 days</h2>
            <app-bar-chart [labels]="days()" [values]="counts()" [height]="280" />
          </div>

          <div class="brand-card brand-card--pad">
            <h2 class="h-section" style="margin-bottom:16px;">Today's schedule</h2>
            @if (today.isLoading()) {
              <app-loading />
            } @else if (today.data()?.length) {
              <div class="stack">
                @for (a of today.data()!; track a.id) {
                  <div class="row" (click)="open(a.id)">
                    <div>
                      <div style="font-weight:600;font-size:14px;">{{ a.patientName }}</div>
                      <div class="text-secondary" style="font-size:12px;">
                        {{ time(a.scheduledAt) }} · {{ a.doctorName }}
                      </div>
                    </div>
                    <app-badge [color]="statusColor[a.status]">{{ StatusName[a.status] }}</app-badge>
                  </div>
                }
              </div>
            } @else {
              <p class="text-secondary" style="font-size:14px;">No appointments today.</p>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .tile-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        margin-bottom: 12px;
      }
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
        padding: 8px;
        border-radius: 8px;
      }
      .row:hover {
        background: rgba(15, 23, 42, 0.04);
      }
    `,
  ],
})
export class DashboardComponent {
  private readonly clinic = inject(ClinicApi)
  private readonly router = inject(Router)

  protected readonly dash = this.clinic.dashboard()
  protected readonly today = this.clinic.todayAppointments()

  protected readonly StatusName = StatusName
  protected readonly statusColor = statusColor
  protected readonly time = fmtTime

  protected readonly tiles: { key: TileKey; label: string; icon: string; color: string }[] = [
    { key: 'totalPatients', label: 'Total Patients', icon: 'groups', color: '#0d9488' },
    { key: 'todaysAppointments', label: "Today's Appointments", icon: 'event', color: '#0284c7' },
    { key: 'pendingAppointments', label: 'Pending', icon: 'pending_actions', color: '#d97706' },
    { key: 'activePrescriptions', label: 'Active Prescriptions', icon: 'medication', color: '#4f46e5' },
    { key: 'newPatientsThisMonth', label: 'New This Month', icon: 'person_add', color: '#059669' },
  ]

  protected readonly days = computed(() =>
    (this.dash.data()?.appointmentsLast7Days ?? []).map((d) => fmtWeekday(d.day)),
  )
  protected readonly counts = computed(() =>
    (this.dash.data()?.appointmentsLast7Days ?? []).map((d) => d.count),
  )

  protected open(id: string): void {
    this.router.navigate(['/appointments', id])
  }
}
