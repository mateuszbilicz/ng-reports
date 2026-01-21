import {Component, inject} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {AuthService} from '../../Services/AuthService/AuthService';
import {ButtonModule} from 'primeng/button';
import {TooltipModule} from 'primeng/tooltip';
import {AvatarModule} from 'primeng/avatar';
import {MenuModule} from 'primeng/menu';
import {RolesService} from '../../Services/roles-service/roles-service';
import {Role} from '../../Models/Role';
import {NgReportsComponent, NgReportsService} from 'ng-reports-form';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    TooltipModule,
    AvatarModule,
    MenuModule,
    NgReportsComponent
  ],
  template: `
    <div class="min-h-screen flex flex-column md:flex-row bg-gray-50 text-color">

      <nav class="w-full md:w-16rem surface-card shadow-4 flex flex-column p-3 md:h-screen sticky top-0 z-5">

        <div class="flex align-items-center gap-2 mb-4 md:mb-6 px-2">
          <i class="pi pi-chart-bar text-2xl text-primary-500"></i>
          <span class="text-xl font-bold hidden md:inline">NgReports</span>
        </div>

        <div class="flex flex-row md:flex-column gap-2 overflow-x-auto md:overflow-visible flex-1">

          @for (link of links; track link.route) {
            @if (!link.minRole || minRole(link.minRole)) {
              <a [routerLink]="link.route" routerLinkActive="surface-hover text-primary"
                 class="p-3 border-round-lg cursor-pointer transition-colors no-underline text-color hover:surface-100 flex align-items-center gap-3">
                <i [class]="link.icon + ' text-xl'"></i>
                <span class="hidden md:inline font-medium">{{ link.label }}</span>
              </a>
            }
          }

        </div>

        <div class="mt-auto pt-3 border-top-1 surface-border flex align-items-center gap-3">
          <div class="flex flex-column hidden md:flex overflow-hidden">
            <span class="font-bold text-sm white-space-nowrap">{{ currentUser()?.name }}</span>
            <span class="text-xs text-500 white-space-nowrap">{{ currentUser()?.username }}</span>
          </div>
          <p-button icon="pi pi-flag"
                    class="ml-auto"
                    text
                    severity="danger"
                    (onClick)="openReportDialog()"/>
          <p-button icon="pi pi-sign-out"
                    text
                    severity="danger"
                    (onClick)="logout()"
                    pTooltip="Sign Out"
                    tooltipPosition="top"/>
        </div>

      </nav>

      <main class="flex-1 p-4 overflow-y-auto h-screen">
        <router-outlet></router-outlet>
        <lib-ng-reports/>
      </main>

    </div>
  `
})
export class MainLayout {
  protected readonly authService = inject(AuthService);
  protected readonly rolesService = inject(RolesService);
  protected readonly ngReportsService = inject(NgReportsService);
  currentUser = this.authService.currentUser;

  minRole = this.rolesService.minRole.bind(this.rolesService);
  isAdmin = this.rolesService.isAdmin.bind(this.rolesService);

  readonly links: { label: string, icon: string, route: string, minRole?: Role }[] = [
    {label: 'Projects', icon: 'pi pi-briefcase', route: '/projects'},
    {label: 'Reports', icon: 'pi pi-file', route: '/reports'},
    {label: 'Statistics', icon: 'pi pi-chart-line', route: '/statistics', minRole: Role.Analyst},
    {label: 'Users', icon: 'pi pi-users', route: '/users', minRole: Role.Admin},
    {label: 'System config', icon: 'pi pi-shield', route: '/system-config', minRole: Role.Admin}
  ];

  openReportDialog() {
    this.ngReportsService.open();
  }

  logout() {
    this.authService.logout();
  }
}
