import { TestBed } from '@angular/core/testing';
import { RoleGuard } from './RoleGuard';
import { Router } from '@angular/router';
import { RolesService } from '../Services/roles-service/roles-service';
import { Role } from '../Models/Role';

describe('RoleGuard', () => {
    let guard: RoleGuard;
    let rolesServiceSpy: jasmine.SpyObj<RolesService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        const roleSpy = jasmine.createSpyObj('RolesService', ['minRole']);
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

        TestBed.configureTestingModule({
            providers: [
                RoleGuard,
                { provide: RolesService, useValue: roleSpy },
                { provide: Router, useValue: routerSpyObj }
            ]
        });
        guard = TestBed.inject(RoleGuard);
        rolesServiceSpy = TestBed.inject(RolesService) as jasmine.SpyObj<RolesService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    it('should allow activation if no minRole specified', () => {
        const route = { data: {} } as any;
        expect(guard.canActivate(route, null as any)).toBeTrue();
    });

    it('should allow activation if user has required role', () => {
        const route = { data: { minRole: Role.Admin } } as any;
        rolesServiceSpy.minRole.and.returnValue(true);

        expect(guard.canActivate(route, null as any)).toBeTrue();
        expect(rolesServiceSpy.minRole).toHaveBeenCalledWith(Role.Admin);
    });

    it('should deny activation and redirect if user lacks role', () => {
        const route = { data: { minRole: Role.Admin } } as any;
        rolesServiceSpy.minRole.and.returnValue(false);

        expect(guard.canActivate(route, null as any)).toBeFalse();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
});
