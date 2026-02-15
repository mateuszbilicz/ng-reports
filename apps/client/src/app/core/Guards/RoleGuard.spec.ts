import { vi } from 'vitest';
import {getTestBed, TestBed} from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import {RoleGuard} from './RoleGuard';
import {RolesService} from '../Services/roles-service/roles-service';
import {Router} from '@angular/router';
import {Role} from '../Models/Role';

describe('RoleGuard', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch { }
    });

    let guard: RoleGuard;
    let rolesServiceSpy: any;
    let routerSpy: any;

    const createSpyObj = (methodNames: string[]) => {
        const obj: any = {};
        for (const method of methodNames) {
            obj[method] = vi.fn();
        }
        return obj;
    };

    beforeEach(() => {
        const roleSpy = createSpyObj(['minRole']);
        const routerSpyObj = createSpyObj(['navigate']);

        TestBed.configureTestingModule({
            providers: [
                RoleGuard,
                { provide: RolesService, useValue: roleSpy },
                { provide: Router, useValue: routerSpyObj }
            ]
        });
        guard = TestBed.inject(RoleGuard);
        rolesServiceSpy = TestBed.inject(RolesService);
        routerSpy = TestBed.inject(Router);
    });

    it('should allow activation if no minRole specified', () => {
        const route = { data: {} } as any;
        expect(guard.canActivate(route, null as any)).toBe(true);
    });

    it('should allow activation if user has required role', () => {
        const route = { data: { minRole: Role.Admin } } as any;
        rolesServiceSpy.minRole.mockReturnValue(true);

        expect(guard.canActivate(route, null as any)).toBe(true);
        expect(rolesServiceSpy.minRole).toHaveBeenCalledWith(Role.Admin);
    });

    it('should deny activation and redirect if user lacks role', () => {
        const route = { data: { minRole: Role.Admin } } as any;
        rolesServiceSpy.minRole.mockReturnValue(false);

        expect(guard.canActivate(route, null as any)).toBe(false);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });
});
