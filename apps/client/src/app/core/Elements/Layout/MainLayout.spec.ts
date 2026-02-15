import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainLayout } from './MainLayout';
import { AuthService } from '../../Services/AuthService/AuthService';
import { RolesService } from '../../Services/roles-service/roles-service';
import { NgReportsService } from 'ng-reports-form';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { Role } from '../../Models/Role';
import { vi } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('MainLayout', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch { }
    });

    let component: MainLayout;
    let fixture: ComponentFixture<MainLayout>;
    let authServiceSpy: any;
    let rolesServiceSpy: any;
    let ngReportsServiceSpy: any;
    let routerSpy: any;

    const currentUserSignal = signal<{ name: string, username: string } | null>({ name: 'Test User', username: 'testuser' });

    beforeEach(async () => {
        const authSpy = {
            currentUser: currentUserSignal,
            logout: vi.fn()
        };
        const rolesSpy = {
            minRole: vi.fn(),
            isAdmin: vi.fn()
        };
        const ngReportsSpy = {
            open: vi.fn()
        };
        const routerSpyObj = {
            navigate: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [MainLayout],
            providers: [
                { provide: AuthService, useValue: authSpy },
                { provide: RolesService, useValue: rolesSpy },
                { provide: NgReportsService, useValue: ngReportsSpy },
                { provide: Router, useValue: routerSpyObj },
                { provide: ActivatedRoute, useValue: { snapshot: { data: {} } } }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(MainLayout);
        component = fixture.componentInstance;
        authServiceSpy = TestBed.inject(AuthService);
        rolesServiceSpy = TestBed.inject(RolesService);
        ngReportsServiceSpy = TestBed.inject(NgReportsService);
        routerSpy = TestBed.inject(Router);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display current user info', () => {
        fixture.detectChanges();
        const compiled = fixture.nativeElement as HTMLElement;
        expect(compiled.textContent).toContain('Test User');
        expect(compiled.textContent).toContain('testuser');
    });

    it('should call logout on button click', () => {
        component.logout();
        expect(authServiceSpy.logout).toHaveBeenCalled();
    });

    it('should open report dialog', () => {
        component.openReportDialog();
        expect(ngReportsServiceSpy.open).toHaveBeenCalled();
    });

    it('should filter links based on role', () => {
        rolesServiceSpy.minRole.mockImplementation((role: any) => role !== Role.Admin);

        fixture.detectChanges();
        expect(rolesServiceSpy.minRole(Role.Developer)).toBe(true);
        expect(rolesServiceSpy.minRole(Role.Admin)).toBe(false);
    });
});

