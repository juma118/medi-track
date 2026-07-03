import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { ClinicApi } from '../../core/clinic.api'
import { PageHeaderComponent } from '../../shared/page-header.component'
import { LoadingComponent } from '../../shared/loading.component'
import { BadgeComponent } from '../../shared/badge.component'
import { urgencyColor } from '../../shared/status'
import type { BadgeColor } from '../../shared/status'

// Port of app/(staff)/ai/page.tsx (symptom analyzer + patient-history chat).
@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PageHeaderComponent,
    LoadingComponent,
    BadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <app-page-header title="AI Assistant" subtitle="Symptom analysis and patient-history chat" />
      <div class="brand-card brand-card--pad" style="margin-bottom:24px;">
        <mat-form-field appearance="outline" style="min-width:280px;" subscriptSizing="dynamic">
          <mat-label>Patient context</mat-label>
          <mat-select [ngModel]="patientId()" (ngModelChange)="patientId.set($event)" name="patient">
            @for (p of patients.data()?.items ?? []; track p.id) {
              <mat-option [value]="p.id">{{ p.fullName }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <!-- Symptom analyzer -->
        <div class="brand-card brand-card--pad">
          <h2 class="h-section" style="margin-bottom:12px;">🧠 Symptom analyzer</h2>
          <mat-form-field appearance="outline" class="full" subscriptSizing="dynamic">
            <textarea matInput rows="4" placeholder="Describe the symptoms…" [(ngModel)]="symptoms" name="symptoms"></textarea>
          </mat-form-field>
          <div class="ai-actions">
            <button mat-flat-button color="primary" [disabled]="!patientId() || !symptoms || analyze.isPending()" (click)="runAnalyze()">
              {{ analyze.isPending() ? 'Analyzing…' : 'Analyze' }}
            </button>
            @if (!patientId()) {
              <span class="text-secondary" style="font-size:12px;">Select a patient first.</span>
            }
          </div>

          @if (analyze.data(); as res) {
            <div style="margin-top:16px;">
              <div class="urgency">
                <span class="text-secondary" style="font-size:14px;">Urgency:</span>
                <app-badge [color]="urgencyBadge(res.urgency)">{{ res.urgency }}</app-badge>
              </div>
              <div class="text-secondary" style="font-size:13px;font-weight:600;">Possible conditions</div>
              <ul>@for (c of res.possibleConditions; track c) {<li>{{ c }}</li>}</ul>
              <div class="text-secondary" style="font-size:13px;font-weight:600;">Suggested tests</div>
              <ul>@for (t of res.suggestedTests; track t) {<li>{{ t }}</li>}</ul>
              <div class="alert">{{ res.disclaimer }}</div>
            </div>
          }
        </div>

        <!-- Patient chat -->
        <div class="brand-card brand-card--pad">
          <h2 class="h-section" style="margin-bottom:12px;">💬 Patient history chat</h2>
          <div class="chat">
            @if (history().length === 0) {
              <p class="text-secondary" style="font-size:14px;">Ask about medications, history, past visits…</p>
            }
            @for (m of history(); track $index) {
              <div style="margin-bottom:8px;">
                <div class="q">{{ m.q }}</div>
                <div class="a">{{ m.a }}</div>
              </div>
            }
            @if (chat.isPending()) {
              <app-loading />
            }
          </div>
          <div class="composer">
            <mat-form-field appearance="outline" class="grow" subscriptSizing="dynamic">
              <input matInput placeholder="Ask a question…" [(ngModel)]="question" name="q" (keydown.enter)="ask()" />
            </mat-form-field>
            <button mat-flat-button color="primary" [disabled]="!patientId() || !question || chat.isPending()" (click)="ask()">Ask</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .full {
        width: 100%;
      }
      .ai-actions {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-top: 12px;
      }
      .urgency {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
      }
      ul {
        margin: 4px 0 12px;
        padding-left: 20px;
        font-size: 14px;
      }
      .alert {
        background: #fef3c7;
        color: #b45309;
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 13px;
        margin-top: 8px;
      }
      .chat {
        max-height: 320px;
        overflow: auto;
        margin-bottom: 12px;
      }
      .q {
        background: #ccfbf1;
        color: #0f766e;
        padding: 8px;
        border-radius: 8px;
        margin-bottom: 4px;
        font-size: 14px;
      }
      .a {
        background: #f1f5f9;
        padding: 8px;
        border-radius: 8px;
        font-size: 14px;
        white-space: pre-line;
      }
      .composer {
        display: flex;
        gap: 8px;
        align-items: flex-start;
      }
      .grow {
        flex-grow: 1;
      }
    `,
  ],
})
export class AiComponent {
  private readonly clinic = inject(ClinicApi)

  protected readonly patientId = signal('')
  protected readonly patients = this.clinic.patients(() => ({ search: '', page: 1, bloodType: '' }))
  protected readonly analyze = this.clinic.analyzeSymptoms()
  protected readonly chat = this.clinic.patientChat()

  protected urgencyBadge(u: string): BadgeColor {
    return urgencyColor[u] ?? 'default'
  }
  protected readonly history = signal<{ q: string; a: string }[]>([])
  protected symptoms = ''
  protected question = ''

  protected runAnalyze(): void {
    if (!this.patientId() || !this.symptoms) return
    this.analyze.mutate({ patientId: this.patientId(), symptoms: this.symptoms })
  }

  protected ask(): void {
    if (!this.patientId() || !this.question) return
    const q = this.question
    this.question = ''
    this.chat.mutate(
      { patientId: this.patientId(), question: q },
      { onSuccess: (res) => this.history.update((h) => [...h, { q, a: res.answer }]) },
    )
  }
}
