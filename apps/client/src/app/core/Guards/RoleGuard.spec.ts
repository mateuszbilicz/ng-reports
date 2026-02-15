// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RoleGuard } from './RoleGuard';
import { RolesService } from '../Services/roles-service/roles-service';
import { Role } from '../Models/Role';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('RoleGuard', () => {
    let guard: RoleGuard;
    let rolesServiceMock: any;
    let routerMock: any;

    beforeEach(() => {
        rolesServiceMock = {
            minRole: vi.fn(),
        };

        routerMock = {
            navigate: vi.fn(),
        };

        TestBed.configureTestingModule({
            providers: [
                RoleGuard,
                { provide: RolesService, useValue: rolesServiceMock },
                { provide: Router, useValue: routerMock },
            ],
        });

        guard = TestBed.inject(RoleGuard);
    });

    it('should return true if no role restriction is defined', () => {
        const route = { data: {} } as any;
        const result = guard.canActivate(route, {} as any);
        expect(result).toBe(true);
    });

    it('should return true if user has required role', () => {
        const route = { data: { minRole: Role.Admin } } as any;
        rolesServiceMock.minRole.mockReturnValue(true);

        const result = guard.canActivate(route, {} as any);

        expect(result).toBe(true);
        expect(rolesServiceMock.minRole).toHaveBeenCalledWith(Role.Admin);
    });

    it('should navigate to home and return false if user doesn\'t have role', () => {
        const route = { data: { minRole: Role.Admin } } as any;
        rolesServiceMock.minRole.mockReturnValue(false);

        const result = guard.canActivate(route, {} as any);

        expect(result).toBe(false);
        expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });
});
