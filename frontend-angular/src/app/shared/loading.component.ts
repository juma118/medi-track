import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

// Port of components/ui.tsx <Loading />.
@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex justify-center" style="padding: 48px 0;">
      <mat-progress-spinner mode="indeterminate" diameter="40"></mat-progress-spinner>
    </div>
  `,
})
export class LoadingComponent {}
