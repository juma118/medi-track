import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import type { BadgeColor } from './status'

/**
 * A colored pill — replaces MUI's <Chip color="success" | "warning" | …>.
 * Angular Material chips don't carry semantic colors, so we render a small
 * self-styled badge with the same palette as the React app.
 */
@Component({
  selector: 'app-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="badge" [class]="'badge--' + color + (outlined ? ' badge--outlined' : '')"
    ><ng-content></ng-content
  ></span>`,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        height: 24px;
        padding: 0 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        line-height: 1;
        white-space: nowrap;
      }
      .badge--small {
        height: 20px;
        font-size: 11px;
      }
      .badge--default {
        background: #eef2f6;
        color: #475569;
      }
      .badge--primary {
        background: #ccfbf1;
        color: #0f766e;
      }
      .badge--secondary {
        background: #e0e7ff;
        color: #3730a3;
      }
      .badge--success {
        background: #d1fae5;
        color: #047857;
      }
      .badge--warning {
        background: #fef3c7;
        color: #b45309;
      }
      .badge--error {
        background: #ffe4e6;
        color: #be123c;
      }
      .badge--info {
        background: #e0f2fe;
        color: #0369a1;
      }
      .badge--outlined {
        background: transparent;
        border: 1px solid currentColor;
      }
    `,
  ],
})
export class BadgeComponent {
  @Input() color: BadgeColor = 'default'
  @Input() outlined = false
}
