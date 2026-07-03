import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { PortalApi } from '../../core/portal.api'
import { PageHeaderComponent } from '../../shared/page-header.component'
import { LoadingComponent } from '../../shared/loading.component'
import { BadgeComponent } from '../../shared/badge.component'
import { summaryColor } from '../../shared/status'
import { SummaryStatusName } from '../../core/models'

// Port of app/portal/records/page.tsx.
@Component({
  selector: 'app-portal-records',
  standalone: true,
  imports: [PageHeaderComponent, LoadingComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <app-page-header title="My Medical Records" subtitle="Documents and AI summaries shared by your clinic" />
      <div class="brand-card brand-card--pad">
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
          <p class="text-secondary" style="font-size:14px;">No records available.</p>
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
export class PortalRecordsComponent {
  private readonly portal = inject(PortalApi)
  protected readonly records = this.portal.myRecords()

  protected readonly summaryColor = summaryColor
  protected readonly SummaryStatusName = SummaryStatusName

  protected openFile(recordId: string): void {
    void this.portal.openMyRecordFile(recordId)
  }
}
