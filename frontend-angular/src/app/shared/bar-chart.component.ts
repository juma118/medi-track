import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core'

// Lightweight CSS bar chart — stands in for MUI X <BarChart /> on the dashboard.
@Component({
  selector: 'app-bar-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart" [style.height.px]="height">
      @for (b of bars(); track b.label + $index) {
        <div class="col">
          <span class="value">{{ b.value }}</span>
          <div class="bar" [style.height.%]="b.pct" [title]="b.label + ': ' + b.value"></div>
          <span class="label">{{ b.label }}</span>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .chart {
        display: flex;
        align-items: flex-end;
        gap: 12px;
        padding-top: 8px;
      }
      .col {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        justify-content: flex-end;
        gap: 6px;
      }
      .value {
        font-size: 12px;
        font-weight: 600;
        color: #334155;
      }
      .bar {
        width: 100%;
        max-width: 44px;
        min-height: 4px;
        background: linear-gradient(180deg, #14b8a6, #0d9488);
        border-radius: 6px 6px 0 0;
        transition: height 0.3s ease;
      }
      .label {
        font-size: 12px;
        color: #64748b;
      }
    `,
  ],
})
export class BarChartComponent {
  private readonly _labels = signal<string[]>([])
  private readonly _values = signal<number[]>([])

  @Input() height = 280
  @Input() set labels(v: string[]) {
    this._labels.set(v ?? [])
  }
  @Input() set values(v: number[]) {
    this._values.set(v ?? [])
  }

  protected readonly bars = computed(() => {
    const labels = this._labels()
    const values = this._values()
    const max = Math.max(1, ...values)
    return labels.map((label, i) => {
      const value = values[i] ?? 0
      return { label, value, pct: Math.round((value / max) * 100) }
    })
  })
}
