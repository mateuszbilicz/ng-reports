import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthGuard } from './AuthGuard';
import { AuthService } from '../Services/AuthService/AuthService';
import { signal } from '@angular/core';

describe('AuthGuard', () => {
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    // Signal for isLoggedIn
    const isLoggedInSignal = signal(false);

    beforeEach(() => {
        const authSpy = jasmine.createSpyObj('AuthService', [], {
            isLoggedIn: isLoggedInSignal
        });
        const routerSpyObj = jasmine.createSpyObj('Router', ['createUrlTree']);

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpyObj }
            ]
        });
        authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    it('should allow navigation if logged in', () => {
        isLoggedInSignal.set(true);

        // Execute guard in injection context
        const result = TestBed.runInInjectionContext(() => AuthGuard(null as any, null as any));

        expect(result).toBeTrue();
    });

    it('should redirect to login if not logged in', () => {
        isLoggedInSignal.set(false);
        const mockUrlTree = {} as UrlTree;
        routerSpy.createUrlTree.and.returnValue(mockUrlTree);

        const result = TestBed.runInInjectionContext(() => AuthGuard(null as any, null as any));

        expect(result).toBe(mockUrlTree);
        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    });
});
