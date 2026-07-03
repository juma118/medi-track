import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import type { Message } from '../core/models'

// Port of components/Thread.tsx — chat bubbles aligned by author.
@Component({
  selector: 'app-thread',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (messages.length === 0) {
      <p class="text-secondary" style="font-size: 14px; margin: 0;">No messages yet.</p>
    } @else {
      <div class="thread">
        @for (m of messages; track m.id) {
          <div class="row" [class.mine]="m.fromPatient === mineIsPatient">
            <div class="bubble" [class.bubble--mine]="m.fromPatient === mineIsPatient">
              <span class="sender">{{ m.senderName }}</span>
              <span class="body">{{ m.body }}</span>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .thread {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 340px;
        overflow: auto;
      }
      .row {
        display: flex;
        justify-content: flex-start;
      }
      .row.mine {
        justify-content: flex-end;
      }
      .bubble {
        max-width: 78%;
        padding: 8px 12px;
        border-radius: 12px;
        background: #f1f5f9;
        color: #0f172a;
      }
      .bubble--mine {
        background: #0d9488;
        color: #fff;
      }
      .sender {
        display: block;
        font-size: 12px;
        opacity: 0.7;
      }
      .body {
        display: block;
        font-size: 14px;
        white-space: pre-line;
      }
    `,
  ],
})
export class ThreadComponent {
  @Input() messages: Message[] = []
  @Input() mineIsPatient = false
}
