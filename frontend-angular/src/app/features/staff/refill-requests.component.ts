import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { PortalApi } from '../../core/portal.api'
import { PageHeaderComponent } from '../../shared/page-header.component'
import { LoadingComponent } from '../../shared/loading.component'
import { fmtDate } from '../../shared/format'

// Port of app/(staff)/refill-requests/page.tsx.
@Component({
  selector: 'app-refill-requests',
  standalone: true,
  imports: [MatButtonModule, PageHeaderComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <app-page-header title="Refill Requests" subtitle="Review and approve patient refill requests" />
      <div class="brand-card brand-card--pad">
        @if (refills.isLoading()) {
          <app-loading />
        } @else if (refills.data()?.length) {
          <div class="stack">
            @for (r of refills.data()!; track r.id) {
              <div class="row">
                <div>
                  <div style="font-weight:600;">{{ r.medication }}</div>
                  <div class="text-secondary" style="font-size:14px;">{{ r.patientName }} · {{ date(r.createdAt) }}</div>
                  @if (r.patientNote) {
                    <div class="text-secondary" style="font-size:12px;">“{{ r.patientNote }}”</div>
                  }
                </div>
                <div class="actions">
                  <button mat-flat-button color="primary" [disabled]="resolve.isPending()"
                    (click)="resolve.mutate({ id: r.id, approve: true, responseNote: 'Approved' })">Approve</button>
                  <button mat-stroked-button [disabled]="resolve.isPending()" class="deny"
                    (click)="resolve.mutate({ id: r.id, approve: false, responseNote: 'Please book a visit' })">Deny</button>
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="text-secondary" style="font-size:14px;">No pending refill requests.</p>
        }
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
        padding: 16px;
        flex-wrap: wrap;
        gap: 8px;
      }
      .actions {
        display: flex;
        gap: 8px;
      }
      .deny {
        color: #be123c !important;
        border-color: #fecdd3 !important;
      }
    `,
  ],
})
export class RefillRequestsComponent {
  private readonly portal = inject(PortalApi)
  protected readonly refills = this.portal.pendingRefills()
  protected readonly resolve = this.portal.resolveRefill()
  protected readonly date = fmtDate
}
