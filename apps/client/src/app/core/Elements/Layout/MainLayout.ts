import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../Services/AuthService/AuthService';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { RolesService } from '../../Services/roles-service/roles-service';

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
    MenuModule
  ],
  template: `
    <div class="min-h-screen flex flex-column md:flex-row bg-gray-50 text-color">
      
      <!-- Sidebar / Mobile Navbar -->
      <nav class="w-full md:w-16rem surface-card shadow-4 flex flex-column p-3 md:h-screen sticky top-0 z-5">
        
        <!-- Logo / Brand -->
        <div class="flex align-items-center gap-2 mb-4 md:mb-6 px-2">
          <i class="pi pi-chart-bar text-2xl text-primary-500"></i>
          <span class="text-xl font-bold hidden md:inline">NgReports</span>
        </div>

        <!-- Navigation Links -->
        <div class="flex flex-row md:flex-column gap-2 overflow-x-auto md:overflow-visible flex-1">
          
          <a routerLink="/projects" routerLinkActive="surface-hover text-primary" 
             class="p-3 border-round-lg cursor-pointer transition-colors no-underline text-color hover:surface-100 flex align-items-center gap-3">
            <i class="pi pi-briefcase text-xl"></i>
            <span class="hidden md:inline font-medium">Projects</span>
          </a>

          <a routerLink="/reports" routerLinkActive="surface-hover text-primary" 
             class="p-3 border-round-lg cursor-pointer transition-colors no-underline text-color hover:surface-100 flex align-items-center gap-3">
            <i class="pi pi-file text-xl"></i>
            <span class="hidden md:inline font-medium">Reports</span>
          </a>

          @if (isAdmin()) {
            <a routerLink="/users" routerLinkActive="surface-hover text-primary" 
               class="p-3 border-round-lg cursor-pointer transition-colors no-underline text-color hover:surface-100 flex align-items-center gap-3">
              <i class="pi pi-users text-xl"></i>
              <span class="hidden md:inline font-medium">Users</span>
            </a>
          }

        </div>

        <!-- User Profile (Bottom) -->
        <div class="mt-auto pt-3 border-top-1 surface-border flex align-items-center gap-3">
           <p-avatar 
             icon="pi pi-user" 
             styleClass="mr-2" 
             shape="circle"
             [style]="{'background-color': 'var(--primary-color)', 'color': '#ffffff'}">
           </p-avatar>
           <div class="flex flex-column hidden md:flex overflow-hidden">
             <span class="font-bold text-sm white-space-nowrap">{{ currentUser()?.name }}</span>
             <span class="text-xs text-500 white-space-nowrap">{{ currentUser()?.username }}</span>
           </div>
           <button 
             pButton 
             icon="pi pi-sign-out" 
             class="p-button-text p-button-rounded p-button-danger ml-auto"
             (click)="logout()"
             pTooltip="Sign Out"
             tooltipPosition="top">
           </button>
        </div>

      </nav>

      <!-- Main Content Area -->
      <main class="flex-1 p-4 overflow-y-auto h-screen">
        <router-outlet></router-outlet>
      </main>

    </div>
  `
})
export class MainLayout {
  protected readonly authService = inject(AuthService);
  protected readonly rolesService = inject(RolesService);
  currentUser = this.authService.currentUser;

  minRole = this.rolesService.minRole.bind(this.rolesService);
  isAdmin = this.rolesService.isAdmin.bind(this.rolesService);

  logout() {
    this.authService.logout();
  }
}
