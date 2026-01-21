import {computed, inject, Injectable} from '@angular/core';
import {Role} from '../../Models/Role';
import {AuthService} from '../AuthService/AuthService';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  protected readonly authService = inject(AuthService);
  protected readonly role = computed(() => parseInt((this.authService.currentUser()?.role as unknown as string) ?? '0') ?? 0);

  minRole(role: Role) {
    return this.role() >= role;
  }

  isAdmin() {
    return this.role() === Role.Admin;
  }

  isDeveloper() {
    return this.role() === Role.Developer;
  }

  isProjectManager() {
    return this.role() === Role.ProjectManager;
  }

  isAnalyst() {
    return this.role() === Role.Analyst;
  }
}
