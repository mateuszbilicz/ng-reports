// @vitest-environment jsdom
import {TestBed} from '@angular/core/testing';
import {Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {AuthService} from './AuthService';
import {AuthService as ApiAuthService} from '../../swagger/api/auth.service';
import {beforeEach, describe, expect, it, vi} from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let apiAuthServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    apiAuthServiceMock = {
      authControllerLogin: vi.fn(),
      authControllerRefreshToken: vi.fn(),
      authControllerGetUser: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    // Clear localStorage before each test
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {provide: ApiAuthService, useValue: apiAuthServiceMock},
        {provide: Router, useValue: routerMock},
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for isLoggedIn when no token is present', () => {
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should return true for isLoggedIn when token is present', () => {
    // We need to set session to trigger the signal
    (service as any).setSession('token', 'refresh');
    expect(service.isLoggedIn()).toBe(true);
  });

  describe('login', () => {
    it('should set session and fetch user on successful login', () => {
      const loginResponse = {accessToken: 'at', refreshToken: 'rt'};
      const userResponse = {username: 'testuser'};

      apiAuthServiceMock.authControllerLogin.mockReturnValue(of(loginResponse));
      apiAuthServiceMock.authControllerGetUser.mockReturnValue(of(userResponse));

      service.login({username: 'user', password: 'password'}).subscribe();

      expect(apiAuthServiceMock.authControllerLogin).toHaveBeenCalled();
      expect(localStorage.getItem('access_token')).toBe('at');
      expect(localStorage.getItem('refresh_token')).toBe('rt');
      expect(service.getToken()).toBe('at');
      expect(service.currentUser()).toEqual(userResponse);
    });
  });

  describe('refreshToken', () => {
    it('should logout if no refresh token is present', () => {
      const logoutSpy = vi.spyOn(service, 'logout');

      service.refreshToken().subscribe((result) => {
        expect(result).toBe(false);
        expect(logoutSpy).toHaveBeenCalled();
      });
    });

    it('should share single request if multiple calls made simultaneously', () => {
      localStorage.setItem('refresh_token', 'rt');
      (service as any)._rtkn.set('rt');

      apiAuthServiceMock.authControllerRefreshToken.mockReturnValue(of({
        accessToken: 'new_at',
        refreshToken: 'new_rt'
      }));
      apiAuthServiceMock.authControllerGetUser.mockReturnValue(of({id: 1}));

      const obs1 = service.refreshToken();
      const obs2 = service.refreshToken();

      expect(obs1).toBe(obs2);
    });

    it('should logout and return false on refresh error', () => {
      localStorage.setItem('refresh_token', 'rt');
      (service as any)._rtkn.set('rt');

      apiAuthServiceMock.authControllerRefreshToken.mockReturnValue(throwError(() => new Error('error')));
      const logoutSpy = vi.spyOn(service, 'logout');

      service.refreshToken().subscribe((result) => {
        expect(result).toBe(false);
        expect(logoutSpy).toHaveBeenCalled();
      });
    });
  });

  describe('logout', () => {
    it('should clear session and navigate to login', () => {
      localStorage.setItem('access_token', 'at');
      localStorage.setItem('refresh_token', 'rt');

      service.logout();

      expect(localStorage.getItem('access_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
      expect(service.getToken()).toBeNull();
      expect(service.currentUser()).toBeNull();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});
