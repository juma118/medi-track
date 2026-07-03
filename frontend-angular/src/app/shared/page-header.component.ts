import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

// Port of components/ui.tsx <PageHeader />. The optional action slot is projected.
@Component({
  selector: 'app-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page-header">
      <div>
        <h1 class="h-page">{{ title }}</h1>
        @if (subtitle) {
          <p class="text-secondary" style="margin: 4px 0 0;">{{ subtitle }}</p>
        }
      </div>
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        margin-bottom: 24px;
        gap: 16px;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class PageHeaderComponent {
  @Input({ required: true }) title = ''
  @Input() subtitle?: string
}
