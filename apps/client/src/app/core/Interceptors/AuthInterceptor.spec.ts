// @vitest-environment jsdom
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './AuthInterceptor';
import { AuthService } from '../Services/AuthService/AuthService';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('authInterceptor', () => {
    let httpMock: HttpTestingController;
    let httpClient: HttpClient;
    let authServiceMock: any;

    beforeEach(() => {
        authServiceMock = {
            getToken: vi.fn(),
            refreshToken: vi.fn(),
            logout: vi.fn(),
        };

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([authInterceptor])),
                provideHttpClientTesting(),
                { provide: AuthService, useValue: authServiceMock },
            ],
        });

        httpClient = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should add Authorization header if token exists', () => {
        authServiceMock.getToken.mockReturnValue('test-token');

        httpClient.get('/api/data').subscribe();

        const req = httpMock.expectOne('/api/data');
        expect(req.request.headers.has('Authorization')).toBe(true);
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    });

    it('should not add Authorization header for login or refresh URLs', () => {
        authServiceMock.getToken.mockReturnValue('test-token');

        httpClient.get('/auth/login').subscribe();
        const reqLogin = httpMock.expectOne('/auth/login');
        expect(reqLogin.request.headers.has('Authorization')).toBe(false);

        httpClient.get('/auth/refresh').subscribe();
        const reqRefresh = httpMock.expectOne('/auth/refresh');
        expect(reqRefresh.request.headers.has('Authorization')).toBe(false);
    });

    it('should handle 401 error and retry request after successful refresh', () => {
        authServiceMock.getToken.mockReturnValueOnce('old-token').mockReturnValue('new-token');
        authServiceMock.refreshToken.mockReturnValue(of(true));

        httpClient.get('/api/data').subscribe();

        // First request fails with 401
        const req = httpMock.expectOne('/api/data');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        // Should call refreshToken
        expect(authServiceMock.refreshToken).toHaveBeenCalled();

        // Should retry the request with new token
        const retryReq = httpMock.expectOne('/api/data');
        expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-token');
        retryReq.flush({ data: 'ok' });
    });

    it('should logout if refreshToken fails with false', () => {
        authServiceMock.getToken.mockReturnValue('old-token');
        authServiceMock.refreshToken.mockReturnValue(of(false));

        httpClient.get('/api/data').subscribe({
            error: (err) => {
                expect(err.message).toBe('Session expired');
            }
        });

        const req = httpMock.expectOne('/api/data');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        expect(authServiceMock.logout).toHaveBeenCalled();
    });

    it('should logout if refreshToken throws error', () => {
        authServiceMock.getToken.mockReturnValue('old-token');
        authServiceMock.refreshToken.mockReturnValue(throwError(() => new Error('Refresh failed')));

        httpClient.get('/api/data').subscribe({
            error: (err) => {
                expect(err.message).toBe('Refresh failed');
            }
        });

        const req = httpMock.expectOne('/api/data');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        expect(authServiceMock.logout).toHaveBeenCalled();
    });
});
