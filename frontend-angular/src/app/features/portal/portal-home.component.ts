import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { Router } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { PortalApi } from '../../core/portal.api'
import { PageHeaderComponent } from '../../shared/page-header.component'
import { LoadingComponent } from '../../shared/loading.component'
import { BadgeComponent } from '../../shared/badge.component'
import { statusColor } from '../../shared/status'
import { StatusName } from '../../core/models'
import { fmtDateTime } from '../../shared/format'

// Port of app/portal/page.tsx.
@Component({
  selector: 'app-portal-home',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, PageHeaderComponent, LoadingComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (me.isLoading() || !me.data()) {
      <app-loading />
    } @else {
      @let profile = me.data()!;
      <div>
        <app-page-header [title]="'Welcome, ' + profile.fullName.split(' ')[0]" subtitle="Your health at a glance" />

        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div class="brand-card brand-card--pad md:col-span-2">
            <h2 class="h-section" style="margin-bottom:12px;">Next appointment</h2>
            @if (upcoming(); as u) {
              <div class="between">
                <div>
                  <div style="font-size:1.15rem;font-weight:700;">{{ dateTime(u.scheduledAt) }}</div>
                  <div class="text-secondary" style="font-size:14px;">Dr. {{ u.doctorName }} · {{ u.reason ?? 'General' }}</div>
                </div>
                <app-badge [color]="statusColor[u.status]">{{ StatusName[u.status] }}</app-badge>
              </div>
            } @else {
              <p class="text-secondary" style="font-size:14px;">
                No upcoming appointments.
                <button mat-button color="primary" (click)="go('/portal/appointments')">Book one</button>
              </p>
            }
          </div>

          <div class="brand-card brand-card--pad">
            <h2 class="h-section" style="margin-bottom:12px;">Active medications</h2>
            <div style="font-size:2.2rem;font-weight:700;">{{ meds.data()?.length ?? 0 }}</div>
            <button mat-button color="primary" style="margin-top:8px;" (click)="go('/portal/prescriptions')">View &amp; request refills</button>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button class="quick" (click)="go('/portal/appointments')">
            <div class="quick-icon"><mat-icon>event</mat-icon></div>
            <div class="quick-label">Book appointment</div>
          </button>
          <button class="quick" (click)="go('/portal/records')">
            <div class="quick-icon"><mat-icon>description</mat-icon></div>
            <div class="quick-label">View my records</div>
          </button>
          <button class="quick" (click)="go('/portal/messages')">
            <div class="quick-icon"><mat-icon>chat</mat-icon></div>
            <div class="quick-label">Message my clinic</div>
          </button>
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
      .quick {
        background: #fff;
        border: 1px solid rgba(15, 23, 42, 0.07);
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        border-radius: 14px;
        padding: 20px;
        text-align: center;
        cursor: pointer;
        transition: 0.15s;
      }
      .quick:hover {
        border-color: #0d9488;
        box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
      }
      .quick-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #ccfbf1;
        color: #0f766e;
        display: grid;
        place-items: center;
        margin: 0 auto 8px;
      }
      .quick-label {
        font-weight: 600;
        font-size: 14px;
      }
    `,
  ],
})
export class PortalHomeComponent {
  private readonly portal = inject(PortalApi)
  private readonly router = inject(Router)

  protected readonly me = this.portal.myProfile()
  protected readonly appts = this.portal.myAppointments()
  protected readonly meds = this.portal.myPrescriptions()

  protected readonly statusColor = statusColor
  protected readonly StatusName = StatusName
  protected readonly dateTime = fmtDateTime

  protected readonly upcoming = computed(() => {
    const now = Date.now()
    return (this.appts.data() ?? [])
      .filter((a) => new Date(a.scheduledAt).getTime() >= now && (a.status === 1 || a.status === 2))
      .sort((x, y) => new Date(x.scheduledAt).getTime() - new Date(y.scheduledAt).getTime())[0]
  })

  protected go(path: string): void {
    this.router.navigateByUrl(path)
  }
}
