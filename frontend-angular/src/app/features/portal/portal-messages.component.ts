import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { PortalApi } from '../../core/portal.api'
import { PageHeaderComponent } from '../../shared/page-header.component'
import { LoadingComponent } from '../../shared/loading.component'
import { ThreadComponent } from '../../shared/thread.component'

// Port of app/portal/messages/page.tsx.
@Component({
  selector: 'app-portal-messages',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    PageHeaderComponent,
    LoadingComponent,
    ThreadComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <app-page-header title="Messages" subtitle="Securely message your care team" />
      <div class="brand-card brand-card--pad">
        @if (messages.isLoading()) {
          <app-loading />
        } @else {
          <app-thread [messages]="messages.data() ?? []" [mineIsPatient]="true" />
        }
        <div class="composer">
          <mat-form-field appearance="outline" class="grow" subscriptSizing="dynamic">
            <input matInput placeholder="Type a message…" [(ngModel)]="text" name="msg" (keydown.enter)="submit()" />
          </mat-form-field>
          <button mat-flat-button color="primary" (click)="submit()" [disabled]="send.isPending() || !text.trim()">Send</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .composer {
        display: flex;
        gap: 8px;
        margin-top: 16px;
        align-items: flex-start;
      }
      .grow {
        flex-grow: 1;
      }
    `,
  ],
})
export class PortalMessagesComponent {
  private readonly portal = inject(PortalApi)

  protected readonly messages = this.portal.myMessages()
  protected readonly send = this.portal.sendMessage()
  protected text = ''

  protected submit(): void {
    const body = this.text.trim()
    if (!body) return
    this.send.mutate({ body })
    this.text = ''
  }
}
