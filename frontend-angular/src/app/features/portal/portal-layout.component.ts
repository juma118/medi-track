import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { AppShellComponent, type NavItem } from '../../shared/app-shell.component'

// Port of app/portal/layout.tsx.
@Component({
  selector: 'app-portal-layout',
  standalone: true,
  imports: [RouterOutlet, AppShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-shell [items]="items" brand="Patient Portal">
      <router-outlet />
    </app-shell>
  `,
})
export class PortalLayoutComponent {
  protected readonly items: NavItem[] = [
    { href: '/portal', label: 'Home', icon: 'home' },
    { href: '/portal/appointments', label: 'Appointments', icon: 'event' },
    { href: '/portal/prescriptions', label: 'Prescriptions', icon: 'medication' },
    { href: '/portal/records', label: 'My Records', icon: 'description' },
    { href: '/portal/messages', label: 'Messages', icon: 'chat' },
  ]
}
