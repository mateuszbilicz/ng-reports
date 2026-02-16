// @vitest-environment jsdom
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AuthViewComponent} from './auth-view.component';
import {AuthService} from '../../core/Services/AuthService/AuthService';
import {Router} from '@angular/router';
import {MessageService} from 'primeng/api';
import {ReactiveFormsModule} from '@angular/forms';
import {of, throwError} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

describe('AuthViewComponent', () => {
  let component: AuthViewComponent;
  let fixture: ComponentFixture<AuthViewComponent>;
  let authServiceMock: any;
  let routerMock: any;
  let messageServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        AuthViewComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
      ],
      providers: [
        MessageService, // Use real service
        {provide: AuthService, useValue: authServiceMock},
        {provide: Router, useValue: routerMock},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthViewComponent);
    component = fixture.componentInstance;
    messageServiceMock = TestBed.inject(MessageService);
    vi.spyOn(messageServiceMock, 'add');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize loginForm with empty values', () => {
    expect(component.loginForm.value).toEqual({
      username: '',
      password: '',
    });
  });

  it('should be invalid when empty', () => {
    expect(component.loginForm.valid).toBe(false);
  });

  it('should be valid when username and password are provided', () => {
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'testpassword',
    });
    expect(component.loginForm.valid).toBe(true);
  });

  describe('onSubmit', () => {
    it('should not call authService.login if form is invalid', () => {
      component.onSubmit();
      expect(authServiceMock.login).not.toHaveBeenCalled();
    });

    it('should call authService.login and navigate on success', () => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'testpassword',
      });
      authServiceMock.login.mockReturnValue(of(undefined));

      component.onSubmit();

      // loading should be false again after success
      expect(component.loading).toBe(false);
      expect(authServiceMock.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpassword',
      });

      expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should show error message on login failure', () => {
      component.loginForm.patchValue({
        username: 'testuser',
        password: 'testpassword',
      });
      authServiceMock.login.mockReturnValue(throwError(() => new Error('Login failed')));

      // In the component, MessageService is provided locally.
      // We need to spy on the instance that the component actually uses.
      const localMessageService = fixture.debugElement.injector.get(MessageService);
      const addSpy = vi.spyOn(localMessageService, 'add');

      component.onSubmit();

      expect(component.loading).toBe(false);
      expect(addSpy).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Login Failed',
        detail: 'Invalid credentials or server error',
      });
    });
  });
});
