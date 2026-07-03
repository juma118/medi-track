import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { PortalApi } from '../../core/portal.api'
import { PageHeaderComponent } from '../../shared/page-header.component'
import { LoadingComponent } from '../../shared/loading.component'
import { BadgeComponent } from '../../shared/badge.component'
import { refillColor } from '../../shared/status'
import { RefillStatusName } from '../../core/models'
import { fmtDate } from '../../shared/format'

// Port of app/portal/prescriptions/page.tsx.
@Component({
  selector: 'app-portal-prescriptions',
  standalone: true,
  imports: [MatButtonModule, PageHeaderComponent, LoadingComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <app-page-header title="My Prescriptions" subtitle="Active medications and refill requests" />
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="brand-card brand-card--pad">
          <h2 class="h-section" style="margin-bottom:12px;">Active medications</h2>
          @if (meds.isLoading()) {
            <app-loading />
          } @else if (meds.data()?.length) {
            <div class="stack">
              @for (m of meds.data()!; track m.id) {
                <div class="row">
                  <div>
                    <div style="font-weight:600;font-size:14px;">{{ m.medication }} · {{ m.dosage }}</div>
                    <div class="text-secondary" style="font-size:12px;">{{ m.frequency }}</div>
                  </div>
                  @if (pendingFor(m.id)) {
                    <app-badge color="warning">Refill requested</app-badge>
                  } @else {
                    <button mat-stroked-button class="sm" [disabled]="request.isPending()"
                      (click)="request.mutate({ prescriptionId: m.id, note: 'Refill please' })">Request refill</button>
                  }
                </div>
              }
            </div>
          } @else {
            <p class="text-secondary" style="font-size:14px;">No active medications.</p>
          }
        </div>

        <div class="brand-card brand-card--pad">
          <h2 class="h-section" style="margin-bottom:12px;">Refill requests</h2>
          @if (refills.isLoading()) {
            <app-loading />
          } @else if (refills.data()?.length) {
            <div class="stack">
              @for (r of refills.data()!; track r.id) {
                <div class="row soft-surface" style="padding:12px;border:none;">
                  <div>
                    <div style="font-weight:600;font-size:14px;">{{ r.medication }}</div>
                    <div class="text-secondary" style="font-size:12px;">
                      {{ date(r.createdAt) }}{{ r.responseNote ? ' · ' + r.responseNote : '' }}
                    </div>
                  </div>
                  <app-badge [color]="refillColor[r.status]">{{ RefillStatusName[r.status] }}</app-badge>
                </div>
              }
            </div>
          } @else {
            <p class="text-secondary" style="font-size:14px;">No refill requests yet.</p>
          }
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
      .sm {
        min-height: 32px;
        line-height: 32px;
        font-size: 13px !important;
      }
    `,
  ],
})
export class PortalPrescriptionsComponent {
  private readonly portal = inject(PortalApi)

  protected readonly meds = this.portal.myPrescriptions()
  protected readonly refills = this.portal.myRefills()
  protected readonly request = this.portal.requestRefill()

  protected readonly refillColor = refillColor
  protected readonly RefillStatusName = RefillStatusName
  protected readonly date = fmtDate

  protected pendingFor(rxId: string): boolean {
    return !!this.refills.data()?.find((r) => r.prescriptionId === rxId && r.status === 1)
  }
}
