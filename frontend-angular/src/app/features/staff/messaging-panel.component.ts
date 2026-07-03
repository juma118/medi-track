import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { PortalApi } from '../../core/portal.api'
import { LoadingComponent } from '../../shared/loading.component'
import { ThreadComponent } from '../../shared/thread.component'

// Port of the MessagingPanel sub-component in patients/[id]/page.tsx (clinic side).
@Component({
  selector: 'app-messaging-panel',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, LoadingComponent, ThreadComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="brand-card brand-card--pad">
      <h2 class="h-section" style="margin-bottom:12px;">💬 Messages</h2>
      @if (thread.isLoading()) {
        <app-loading />
      } @else {
        <app-thread [messages]="thread.data() ?? []" [mineIsPatient]="false" />
      }
      <div class="composer">
        <mat-form-field appearance="outline" class="grow" subscriptSizing="dynamic">
          <input matInput placeholder="Reply to patient…" [(ngModel)]="text" name="reply" (keydown.enter)="send()" />
        </mat-form-field>
        <button mat-flat-button color="primary" (click)="send()" [disabled]="reply.isPending() || !text.trim()">Send</button>
      </div>
    </div>
  `,
  styles: [
    `
      .composer {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        align-items: flex-start;
      }
      .grow {
        flex-grow: 1;
      }
    `,
  ],
})
export class MessagingPanelComponent {
  readonly patientId = input.required<string>()

  private readonly portal = inject(PortalApi)
  protected readonly thread = this.portal.patientThread(() => this.patientId())
  protected readonly reply = this.portal.replyToPatient(() => this.patientId())
  protected text = ''

  protected send(): void {
    const body = this.text.trim()
    if (!body) return
    this.reply.mutate({ body })
    this.text = ''
  }
}
