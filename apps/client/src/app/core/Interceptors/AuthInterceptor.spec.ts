import { vi } from 'vitest';
import {getTestBed, TestBed} from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {HttpClient, provideHttpClient, withInterceptors} from '@angular/common/http';
import {authInterceptor} from './AuthInterceptor';
import {AuthService} from '../swagger';
import {of} from 'rxjs';

describe('authInterceptor', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch { }
    });

    let httpTestingController: HttpTestingController;
    let httpClient: HttpClient;
    let authServiceSpy: any;

    beforeEach(() => {
        const authSpy = {
            getToken: vi.fn(),
            refreshToken: vi.fn(),
            logout: vi.fn()
        };

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([authInterceptor])),
                provideHttpClientTesting(),
                { provide: AuthService, useValue: authSpy }
            ]
        });

        httpTestingController = TestBed.inject(HttpTestingController);
        httpClient = TestBed.inject(HttpClient);
        authServiceSpy = TestBed.inject(AuthService);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should add Authorization header if token exists', () => {
        authServiceSpy.getToken.mockReturnValue('test-token');

        httpClient.get('/api/data').subscribe();

        const req = httpTestingController.expectOne('/api/data');
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
        req.flush({});
    });

    it('should not add Authorization header if no token', () => {
        authServiceSpy.getToken.mockReturnValue(null);

        httpClient.get('/api/data').subscribe();

        const req = httpTestingController.expectOne('/api/data');
        expect(req.request.headers.has('Authorization')).toBe(false);
        req.flush({});
    });

    it('should not add token for auth endpoints', () => {
        authServiceSpy.getToken.mockReturnValue('test-token');

        httpClient.post('/auth/login', {}).subscribe();
        const reqLogin = httpTestingController.expectOne('/auth/login');
        expect(reqLogin.request.headers.has('Authorization')).toBe(false);
        reqLogin.flush({});

        httpClient.post('/auth/refresh', {}).subscribe();
        const reqRefresh = httpTestingController.expectOne('/auth/refresh');
        expect(reqRefresh.request.headers.has('Authorization')).toBe(false);
        reqRefresh.flush({});
    });

    it('should handle 401 error by refreshing token', () => {
        authServiceSpy.getToken.mockReturnValueOnce('old-token').mockReturnValueOnce('new-token');
        authServiceSpy.refreshToken.mockReturnValue(of(true));

        httpClient.get('/api/data').subscribe();

        const req = httpTestingController.expectOne('/api/data');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        expect(authServiceSpy.refreshToken).toHaveBeenCalled();

        const retryReq = httpTestingController.expectOne('/api/data');
        expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-token');
        retryReq.flush({});
    });

    it('should logout if refresh fails on 401', () => {
        authServiceSpy.getToken.mockReturnValue('old-token');
        authServiceSpy.refreshToken.mockReturnValue(of(false));

        httpClient.get('/api/data').subscribe({
            error: (error) => {
                expect(error).toBeTruthy();
            }
        });

        const req = httpTestingController.expectOne('/api/data');
        req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

        expect(authServiceSpy.refreshToken).toHaveBeenCalled();
        expect(authServiceSpy.logout).toHaveBeenCalled();
    });
});

