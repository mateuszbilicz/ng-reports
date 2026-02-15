import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthViewComponent } from './auth-view.component';
import { AuthService } from '../../core/Services/AuthService/AuthService';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

describe('AuthViewComponent', () => {
    let component: AuthViewComponent;
    let fixture: ComponentFixture<AuthViewComponent>;
    let authServiceSpy: any;
    let routerSpy: any;
    let messageServiceSpy: any;

    beforeEach(async () => {
        const authSpy = {
            login: vi.fn()
        };
        const routerSpyObj = {
            navigate: vi.fn()
        };
        const messageSpy = {
            add: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [AuthViewComponent, NoopAnimationsModule],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: Router, useValue: routerSpyObj },
            ]
        })
            .overrideComponent(AuthViewComponent, {
                set: {
                    providers: [
                        { provide: MessageService, useValue: messageSpy }
                    ]
                }
            })
            .compileComponents();

        fixture = TestBed.createComponent(AuthViewComponent);
        component = fixture.componentInstance;
        authServiceSpy = TestBed.inject(AuthService);
        routerSpy = TestBed.inject(Router);
        messageServiceSpy = messageSpy;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should be invalid when empty', () => {
        expect(component.loginForm.valid).toBe(false);
    });

    it('should be valid when filled', () => {
        component.loginForm.controls['username'].setValue('test');
        component.loginForm.controls['password'].setValue('password');
        expect(component.loginForm.valid).toBe(true);
    });

    it('should call login on submit', () => {
        component.loginForm.controls['username'].setValue('test');
        component.loginForm.controls['password'].setValue('password');

        authServiceSpy.login.mockReturnValue(of(void 0));

        component.onSubmit();

        expect(component.loading).toBe(false);
        expect(authServiceSpy.login).toHaveBeenCalledWith({ username: 'test', password: 'password' });
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should show error on login failure', () => {
        component.loginForm.controls['username'].setValue('test');
        component.loginForm.controls['password'].setValue('password');

        authServiceSpy.login.mockReturnValue(throwError(() => new Error('Error')));

        component.onSubmit();

        expect(component.loading).toBe(false);
        expect(authServiceSpy.login).toHaveBeenCalled();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error', summary: 'Login Failed' }));
        expect(routerSpy.navigate).not.toHaveBeenCalled();
    });
});

