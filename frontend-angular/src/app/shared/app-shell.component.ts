import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'
import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { NavigationEnd, Router, RouterLink } from '@angular/router'
import { filter, map, startWith } from 'rxjs'
import { MatIconModule } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatTooltipModule } from '@angular/material/tooltip'
import { AuthService } from '../core/auth.service'
import { RoleName } from '../core/models'

export interface NavItem {
  href: string
  label: string
  icon: string // Material icon ligature name
}

/**
 * Port of components/AppShell.tsx — a permanent sidebar on desktop and an
 * overlay drawer on mobile, with brand header, nav list, and a user footer.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterLink,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-sidenav-container class="shell">
      <mat-sidenav
        class="drawer"
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="isMobile() ? mobileOpen() : true"
        (closed)="mobileOpen.set(false)"
      >
        <div class="drawer-inner">
          <div class="brand">
            <div class="brand-avatar"><mat-icon>local_hospital</mat-icon></div>
            <div>
              <div class="brand-name">MediTrack</div>
              <div class="brand-sub">{{ brand }}</div>
            </div>
          </div>
          <div class="divider"></div>

          <nav class="nav">
            @for (it of items; track it.href) {
              <a
                class="nav-item"
                [class.active]="isActive(it.href)"
                [routerLink]="it.href"
                (click)="mobileOpen.set(false)"
              >
                <mat-icon>{{ it.icon }}</mat-icon>
                <span>{{ it.label }}</span>
              </a>
            }
          </nav>

          <div class="divider"></div>
          <div class="user">
            <div class="user-avatar">{{ (auth.fullName() || '?')[0] }}</div>
            <div class="user-meta">
              <div class="user-name">{{ auth.fullName() }}</div>
              <span class="user-role">{{ auth.role() ? RoleName[auth.role()!] : '' }}</span>
            </div>
            <button mat-icon-button matTooltip="Sign out" (click)="signOut()">
              <mat-icon>logout</mat-icon>
            </button>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="content-wrap">
        @if (isMobile()) {
          <mat-toolbar class="topbar">
            <button mat-icon-button (click)="mobileOpen.set(true)"><mat-icon>menu</mat-icon></button>
            <span class="topbar-title">MediTrack</span>
          </mat-toolbar>
        }
        <main class="content"><ng-content></ng-content></main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .shell {
        min-height: 100vh;
        background: #f4f6fb;
      }
      .drawer {
        width: 248px;
        border-right: 1px solid rgba(15, 23, 42, 0.08);
        background: #fff;
      }
      .drawer-inner {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
      }
      .brand-avatar {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: #0d9488;
        color: #fff;
        display: grid;
        place-items: center;
      }
      .brand-avatar mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .brand-name {
        font-weight: 800;
        line-height: 1;
      }
      .brand-sub {
        font-size: 12px;
        color: #64748b;
      }
      .divider {
        height: 1px;
        background: rgba(15, 23, 42, 0.08);
      }
      .nav {
        padding: 16px 12px;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        color: #64748b;
        font-weight: 600;
        font-size: 14px;
        text-decoration: none;
        cursor: pointer;
      }
      .nav-item:hover {
        background: rgba(15, 23, 42, 0.04);
      }
      .nav-item.active {
        background: #0d9488;
        color: #fff;
      }
      .nav-item.active:hover {
        background: #0f766e;
      }
      .nav-item mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .user {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
      }
      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: #4f46e5;
        color: #fff;
        display: grid;
        place-items: center;
        font-weight: 700;
      }
      .user-meta {
        min-width: 0;
        flex-grow: 1;
      }
      .user-name {
        font-weight: 600;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .user-role {
        display: inline-block;
        margin-top: 2px;
        padding: 1px 8px;
        font-size: 11px;
        border-radius: 999px;
        background: #eef2f6;
        color: #475569;
      }
      .content-wrap {
        display: flex;
        flex-direction: column;
      }
      .topbar {
        background: linear-gradient(90deg, #0f766e, #0d9488);
        color: #fff;
        position: sticky;
        top: 0;
        z-index: 5;
      }
      .topbar-title {
        font-weight: 800;
      }
      .content {
        flex-grow: 1;
        padding: 32px;
      }
      @media (max-width: 959px) {
        .content {
          padding: 16px;
        }
      }
    `,
  ],
})
export class AppShellComponent {
  @Input({ required: true }) items: NavItem[] = []
  @Input({ required: true }) brand = ''

  protected readonly auth = inject(AuthService)
  protected readonly RoleName = RoleName
  private readonly router = inject(Router)
  private readonly breakpoints = inject(BreakpointObserver)

  protected readonly mobileOpen = signal(false)
  protected readonly isMobile = toSignal(
    this.breakpoints.observe([Breakpoints.XSmall, Breakpoints.Small]).pipe(map((r) => r.matches)),
    { initialValue: false },
  )

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  )

  protected isActive(href: string): boolean {
    const url = this.currentUrl().split('?')[0]
    return href === '/dashboard' || href === '/portal' ? url === href : url.startsWith(href)
  }

  protected signOut(): void {
    this.auth.logout()
    this.router.navigateByUrl('/login')
  }
}
