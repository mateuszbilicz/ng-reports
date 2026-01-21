import {inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {RolesService} from '../Services/roles-service/roles-service';
import {Role} from '../Models/Role';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private rolesService = inject(RolesService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const minRole = route.data['minRole'] as Role;

    if (minRole === undefined) {
      return true; // No role restriction
    }

    if (this.rolesService.minRole(minRole)) {
      return true;
    }

    // Redirect to home or unauthorized page if needed, or just return false
    this.router.navigate(['/']);
    return false;
  }
}
