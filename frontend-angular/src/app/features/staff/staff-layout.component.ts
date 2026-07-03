import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { AppShellComponent, type NavItem } from '../../shared/app-shell.component'
import { AuthService } from '../../core/auth.service'

// Port of app/(staff)/layout.tsx — builds the role-aware nav and wraps the shell.
@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [RouterOutlet, AppShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-shell [items]="items()" brand="Clinic">
      <router-outlet />
    </app-shell>
  `,
})
export class StaffLayoutComponent {
  private readonly auth = inject(AuthService)

  protected readonly items = computed<NavItem[]>(() => {
    const base: NavItem[] = [
      { href: '/dashboard', label: 'Dashboard', icon: 'space_dashboard' },
      { href: '/patients', label: 'Patients', icon: 'groups' },
      { href: '/appointments', label: 'Appointments', icon: 'event' },
    ]
    if (this.auth.isDoctorSig()) {
      base.push(
        { href: '/records', label: 'Medical Records', icon: 'description' },
        { href: '/prescriptions', label: 'Prescriptions', icon: 'medication' },
        { href: '/refill-requests', label: 'Refill Requests', icon: 'autorenew' },
        { href: '/ai', label: 'AI Assistant', icon: 'smart_toy' },
      )
    }
    return base
  })
}
