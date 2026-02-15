import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailsComponent } from './user-details.component';
import { UsersService } from '../../../core/Services/UsersService/UsersService';
import { ActivatedRoute, Router, provideRouter, convertToParamMap } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Role } from '../../../core/Models/Role';
import { vi } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('UserDetailsComponent', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch { }
    });

    let component: UserDetailsComponent;
    let fixture: ComponentFixture<UserDetailsComponent>;
    let usersServiceSpy: any;
    let routerSpy: any;
    let messageServiceSpy: any;

    const createSpyObj = (methodNames: string[]) => {
        const obj: any = {};
        for (const method of methodNames) {
            obj[method] = vi.fn().mockReturnValue(of({}));
        }
        return obj;
    };

    beforeEach(async () => {
        const usersSpy = createSpyObj(['getUser', 'createUser', 'updateUser']);
        const routerSpyObj = createSpyObj(['navigate']);
        const messageSpy = {
            add: vi.fn(),
            addAll: vi.fn(),
            clear: vi.fn(),
            messageObserver: of(null),
            clearObserver: of(null)
        };

        const routeMock = {
            paramMap: of(convertToParamMap({ username: 'testuser' })),
            queryParams: of({}),
            snapshot: {
                paramMap: convertToParamMap({ username: 'testuser' }),
                queryParams: {}
            }
        };

        await TestBed.configureTestingModule({
            imports: [UserDetailsComponent, NoopAnimationsModule],
            providers: [
                { provide: UsersService, useValue: usersSpy },
                { provide: Router, useValue: routerSpyObj },
                { provide: MessageService, useValue: messageSpy },
                { provide: ActivatedRoute, useValue: routeMock }
            ]
        })
            .overrideComponent(UserDetailsComponent, {
                set: {
                    providers: [
                        { provide: MessageService, useValue: messageSpy },
                        { provide: UsersService, useValue: usersSpy },
                        { provide: Router, useValue: routerSpyObj },
                        { provide: ActivatedRoute, useValue: routeMock }
                    ]
                }
            })
            .compileComponents();

        usersServiceSpy = usersSpy;
        routerSpy = routerSpyObj;
        messageServiceSpy = messageSpy;

        usersServiceSpy.getUser.mockReturnValue(of({ username: 'testuser', role: Role.Admin }));
        usersServiceSpy.createUser.mockReturnValue(of({}));
        usersServiceSpy.updateUser.mockReturnValue(of({}));

        fixture = TestBed.createComponent(UserDetailsComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load user in edit mode', () => {
        const user = { username: 'testuser', name: 'Test User', role: Role.Admin, description: 'desc' } as any;
        usersServiceSpy.getUser.mockReturnValue(of(user));

        fixture.detectChanges();

        expect(component.isEditMode).toBe(true);
        expect(usersServiceSpy.getUser).toHaveBeenCalledWith('testuser');
        expect(component.userForm.value.name).toBe('Test User');
        expect(component.userForm.controls.password.validator).toBeNull();
    });

    it('should update user', () => {
        const user = { username: 'testuser', role: Role.Admin } as any;
        usersServiceSpy.getUser.mockReturnValue(of(user));
        fixture.detectChanges();

        component.userForm.patchValue({ name: 'Updated Name' });
        usersServiceSpy.updateUser.mockReturnValue(of({} as any));

        component.saveUser();

        expect(usersServiceSpy.updateUser).toHaveBeenCalled();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
    });

    it('should create new user', () => {
        const paramsMap = { get: (key: string) => key === 'username' ? 'new' : null };
        (component as any).route.paramMap = of(paramsMap);

        component.ngOnInit();
        fixture.detectChanges();

        expect(component.isEditMode).toBe(false);
        expect(component.userForm.controls.password.validator).toBeTruthy();

        component.userForm.setValue({
            username: 'newuser',
            name: 'New User',
            role: Role.Developer,
            description: 'desc',
            password: 'password'
        });

        usersServiceSpy.createUser.mockReturnValue(of({} as any));

        component.saveUser();

        expect(usersServiceSpy.createUser).toHaveBeenCalled();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
    });
});
