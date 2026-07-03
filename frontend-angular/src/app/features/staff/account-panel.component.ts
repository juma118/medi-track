import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { PortalApi } from '../../core/portal.api'

// Port of the AccountPanel sub-component in patients/[id]/page.tsx (receptionist).
@Component({
  selector: 'app-account-panel',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="brand-card brand-card--pad">
      <h2 class="h-section" style="margin-bottom:12px;">🔑 Portal account</h2>
      @if (create.isSuccess()) {
        <div class="alert alert--ok">Portal account created. The patient can now sign in.</div>
      } @else {
        <form (ngSubmit)="submit()">
          <p class="text-secondary" style="font-size:14px;margin:0 0 12px;">Create a patient-portal login.</p>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Login email</mat-label>
            <input matInput type="email" [(ngModel)]="form.email" name="email" required />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Temporary password (min 8)</mat-label>
            <input matInput [(ngModel)]="form.password" name="password" required />
          </mat-form-field>
          <button mat-flat-button color="primary" type="submit" [disabled]="create.isPending()">Create account</button>
          @if (create.isError()) {
            <div class="alert alert--error" style="margin-top:8px;">
              Could not create — email may be in use or an account already exists.
            </div>
          }
        </form>
      }
    </div>
  `,
  styles: [
    `
      .full {
        width: 100%;
      }
      .alert {
        border-radius: 8px;
        padding: 10px 14px;
        font-size: 14px;
      }
      .alert--ok {
        background: #d1fae5;
        color: #047857;
      }
      .alert--error {
        background: #ffe4e6;
        color: #be123c;
      }
    `,
  ],
})
export class AccountPanelComponent {
  readonly patientId = input.required<string>()

  private readonly portal = inject(PortalApi)
  protected readonly create = this.portal.createPatientAccount(() => this.patientId())
  protected form = { email: '', password: '' }

  protected submit(): void {
    this.create.mutate(this.form)
  }
}
