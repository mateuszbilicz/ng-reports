// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { AuthGuard } from './AuthGuard';
import { AuthService } from '../Services/AuthService/AuthService';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AuthGuard', () => {
    let authServiceMock: any;
    let routerMock: any;

    beforeEach(() => {
        authServiceMock = {
            isLoggedIn: vi.fn(),
        };

        routerMock = {
            createUrlTree: vi.fn(),
        };

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceMock },
                { provide: Router, useValue: routerMock },
            ],
        });
    });

    it('should return true if user is logged in', () => {
        authServiceMock.isLoggedIn.mockReturnValue(true);

        const result = TestBed.runInInjectionContext(() => AuthGuard({} as any, {} as any));

        expect(result).toBe(true);
    });

    it('should return UrlTree to login if user is not logged in', () => {
        const dummyUrlTree = {} as UrlTree;
        authServiceMock.isLoggedIn.mockReturnValue(false);
        routerMock.createUrlTree.mockReturnValue(dummyUrlTree);

        const result = TestBed.runInInjectionContext(() => AuthGuard({} as any, {} as any));

        expect(result).toBe(dummyUrlTree);
        expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    });
});
