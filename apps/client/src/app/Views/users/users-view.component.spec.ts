import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersViewComponent } from './users-view.component';
import { UsersService } from '../../core/Services/UsersService/UsersService';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Role } from '../../core/Models/Role';
import { vi } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('UsersViewComponent', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch { }
    });

    let component: UsersViewComponent;
    let fixture: ComponentFixture<UsersViewComponent>;
    let usersServiceSpy: any;
    let routerSpy: any;
    let messageServiceSpy: any;
    let confirmationServiceSpy: any;

    const createSpyObj = (methodNames: string[]) => {
        const obj: any = {};
        for (const method of methodNames) {
            obj[method] = vi.fn();
        }
        return obj;
    };

    beforeEach(async () => {
        const usrSpy = createSpyObj(['getUsers', 'deleteUser']);
        const routerSpyObj = createSpyObj(['navigate']);
        const messageSpy = createSpyObj(['add']);
        const confirmSpy = createSpyObj(['confirm']);

        await TestBed.configureTestingModule({
            imports: [UsersViewComponent, NoopAnimationsModule],
            providers: [
                { provide: UsersService, useValue: usrSpy },
                { provide: Router, useValue: routerSpyObj }
            ]
        })
            .overrideComponent(UsersViewComponent, {
                set: {
                    providers: [
                        { provide: MessageService, useValue: messageSpy },
                        { provide: ConfirmationService, useValue: confirmSpy }
                    ]
                }
            })
            .compileComponents();

        fixture = TestBed.createComponent(UsersViewComponent);
        component = fixture.componentInstance;
        usersServiceSpy = TestBed.inject(UsersService);
        routerSpy = TestBed.inject(Router);
        messageServiceSpy = messageSpy;
        confirmationServiceSpy = confirmSpy;

        usersServiceSpy.getUsers.mockReturnValue(of({ items: [{ username: 'user1', name: 'User 1' }] } as any));
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load users', () => {
        fixture.detectChanges();
        expect(usersServiceSpy.getUsers).toHaveBeenCalled();
        expect(component.users().length).toBe(1);
    });

    it('should navigate to create new user', () => {
        component.createNewUser();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/users/new']);
    });

    it('should navigate to edit user', () => {
        const user = { username: 'test' } as any;
        component.editUser(user);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/users', 'test']);
    });

    it('should delete user', () => {
        const user = { username: 'test', name: 'Test' } as any;
        confirmationServiceSpy.confirm.mockImplementation((config: any) => config.accept());
        usersServiceSpy.deleteUser.mockReturnValue(of(void 0));

        component.deleteUser(user);

        expect(usersServiceSpy.deleteUser).toHaveBeenCalledWith('test');
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });

    it('should get correct role severity', () => {
        expect(component.getRoleSeverity(Role.Admin)).toBe('danger');
        expect(component.getRoleSeverity(Role.Analyst)).toBe('success');
    });
});
