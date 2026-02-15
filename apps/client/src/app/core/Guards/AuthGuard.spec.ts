import { vi } from 'vitest';
import {getTestBed, TestBed} from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import {signal} from '@angular/core';
import {AuthService} from '../Services/AuthService/AuthService';
import {Router, UrlTree} from '@angular/router';
import {AuthGuard} from './AuthGuard';

describe('AuthGuard', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch { }
    });

    let authServiceSpy: any;
    let routerSpy: any;

    const isLoggedInSignal = signal(false);

    beforeEach(() => {
        const authSpy = { isLoggedIn: isLoggedInSignal };
        const routerSpyObj = { createUrlTree: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpyObj }
            ]
        });
        authServiceSpy = TestBed.inject(AuthService);
        routerSpy = TestBed.inject(Router);
    });

    it('should allow navigation if logged in', () => {
        isLoggedInSignal.set(true);

        const result = TestBed.runInInjectionContext(() => AuthGuard({} as any, {} as any));

        expect(result).toBe(true);
    });

    it('should redirect to login if not logged in', () => {
        isLoggedInSignal.set(false);
        const mockUrlTree = {} as UrlTree;
        routerSpy.createUrlTree.mockReturnValue(mockUrlTree);

        const result = TestBed.runInInjectionContext(() => AuthGuard({} as any, {} as any));

        expect(result).toBe(mockUrlTree);
        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    });
});
