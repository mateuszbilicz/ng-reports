import { TestBed, getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { AuthService } from './AuthService';
import { AuthService as ApiAuthService } from '../../swagger/api/auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserView } from '../../swagger/model/userView';
import { vi } from 'vitest';

describe('AuthService', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch {
            // ignore
        }
    });

    let service: AuthService;
    let apiAuthServiceSpy: any;
    let routerSpy: any;

    const createSpyObj = (methodNames: string[]) => {
        const obj: any = {};
        for (const method of methodNames) {
            obj[method] = vi.fn();
        }
        return obj;
    };

    beforeEach(() => {
        localStorage.clear();

        const apiSpy = createSpyObj(['authControllerLogin', 'authControllerRefreshToken', 'authControllerGetUser']);
        const routerSpyObj = createSpyObj(['navigate']);

        TestBed.configureTestingModule({
            providers: [
                AuthService,
                { provide: ApiAuthService, useValue: apiSpy },
                { provide: Router, useValue: routerSpyObj }
            ]
        });
        service = TestBed.inject(AuthService);
        apiAuthServiceSpy = TestBed.inject(ApiAuthService);
        routerSpy = TestBed.inject(Router);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('login', () => {
        it('should login, set session, and fetch user', async () => {
            const mockLoginResponse = { accessToken: 'access', refreshToken: 'refresh' };
            const mockUser: UserView = {
              createDate: new Date(),
              description: '',
              isActive: false,
              name: 'Test',
              username: 'test', role: 0 };

            apiAuthServiceSpy.authControllerLogin.mockReturnValue(of(mockLoginResponse));
            apiAuthServiceSpy.authControllerGetUser.mockReturnValue(of(mockUser));

            await service.login({ username: 'test', password: 'password' }).toPromise();

            expect(localStorage.getItem('access_token')).toBe('access');
            expect(localStorage.getItem('refresh_token')).toBe('refresh');
            expect(service.isLoggedIn()).toBe(true);
        });
    });

    describe('logout', () => {
        it('should clear session and navigate to login', () => {
            localStorage.setItem('access_token', 'token');
            localStorage.setItem('refresh_token', 'refresh');

            service.logout();

            expect(localStorage.getItem('access_token')).toBeNull();
            expect(localStorage.getItem('refresh_token')).toBeNull();
            expect(service.currentUser()).toBeNull();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/auth/login']);
        });
    });

    describe('refreshToken', () => {
        it('should refresh token if refresh token exists', async () => {
            (service as any).setSession('old_access', 'old_refresh');

            const mockRefreshResponse = { accessToken: 'new_access', refreshToken: 'new_refresh' };
            const mockUser: UserView = { createDate: new Date(), description: '', isActive: false, name: 'Test', username: 'test', role: 0 };

            apiAuthServiceSpy.authControllerRefreshToken.mockReturnValue(of(mockRefreshResponse));
            apiAuthServiceSpy.authControllerGetUser.mockReturnValue(of(mockUser));

            const result = await service.refreshToken().toPromise();

            expect(result).toBe(true);
            expect(localStorage.getItem('access_token')).toBe('new_access');
            expect(localStorage.getItem('refresh_token')).toBe('new_refresh');
        });

        it('should logout if no refresh token', async () => {
            localStorage.removeItem('refresh_token');
            (service as any)._rtkn.set(null);

            vi.spyOn(service, 'logout');

            const result = await service.refreshToken().toPromise();
            expect(result).toBe(false);
            expect(service.logout).toHaveBeenCalled();
        });

        it('should logout if refresh token api fails', async () => {
            (service as any).setSession('old_access', 'old_refresh');

            apiAuthServiceSpy.authControllerRefreshToken.mockReturnValue(throwError(() => new Error('Error')));

            const result = await service.refreshToken().toPromise();
            expect(result).toBe(false);
        });
    });
});
