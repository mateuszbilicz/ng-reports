import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserDetailsComponent } from './user-details.component';
import { UsersService } from '../../../core/Services/UsersService/UsersService';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Role } from '../../../core/Models/Role';

describe('UserDetailsComponent', () => {
    let component: UserDetailsComponent;
    let fixture: ComponentFixture<UserDetailsComponent>;
    let usersServiceSpy: jasmine.SpyObj<UsersService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let messageServiceSpy: jasmine.SpyObj<MessageService>;

    beforeEach(async () => {
        const usrSpy = jasmine.createSpyObj('UsersService', ['getUser', 'createUser', 'updateUser']);
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        const messageSpy = jasmine.createSpyObj('MessageService', ['add']);

        await TestBed.configureTestingModule({
            imports: [UserDetailsComponent, NoopAnimationsModule],
            providers: [
                { provide: UsersService, useValue: usrSpy },
                { provide: Router, useValue: routerSpyObj },
                { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => 'testuser' }) } },
                { provide: MessageService, useValue: messageSpy }
            ]
        })
            .overrideComponent(UserDetailsComponent, {
                set: {
                    providers: [
                        { provide: MessageService, useValue: messageSpy }
                    ]
                }
            })
            .compileComponents();

        fixture = TestBed.createComponent(UserDetailsComponent);
        component = fixture.componentInstance;
        usersServiceSpy = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        messageServiceSpy = messageSpy;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load user in edit mode', () => {
        const user = { username: 'testuser', name: 'Test User', role: Role.Admin, description: 'desc' } as any;
        usersServiceSpy.getUser.and.returnValue(of(user));

        fixture.detectChanges();

        expect(component.isEditMode).toBeTrue();
        expect(usersServiceSpy.getUser).toHaveBeenCalledWith('testuser');
        expect(component.userForm.value.name).toBe('Test User');
        // Password validator should be cleared
        expect(component.userForm.controls.password.validator).toBeNull();
    });

    it('should update user', () => {
        const user = { username: 'testuser', role: Role.Admin } as any;
        usersServiceSpy.getUser.and.returnValue(of(user));
        fixture.detectChanges();

        component.userForm.patchValue({ name: 'Updated Name' });
        usersServiceSpy.updateUser.and.returnValue(of({} as any));

        component.saveUser();

        expect(usersServiceSpy.updateUser).toHaveBeenCalled();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
    });

    it('should create new user', () => {
        // Reconfigure for new user mode
        TestBed.resetTestingModule();
        const usrSpy = jasmine.createSpyObj('UsersService', ['createUser']);
        const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
        const messageSpy = jasmine.createSpyObj('MessageService', ['add']);

        TestBed.configureTestingModule({
            imports: [UserDetailsComponent, NoopAnimationsModule],
            providers: [
                { provide: UsersService, useValue: usrSpy },
                { provide: Router, useValue: routerSpyObj },
                { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => null }) } }, // Null or 'new'? code checks username && username !== 'new'
                // If param is null, username becomes ''.
                // code: this.username = params.get('username') || '';
                // if (this.username && this.username !== 'new') ... else ...
            ]
        })
            .overrideComponent(UserDetailsComponent, {
                set: { providers: [{ provide: MessageService, useValue: messageSpy }] }
            })
            .compileComponents();

        fixture = TestBed.createComponent(UserDetailsComponent);
        component = fixture.componentInstance;
        usersServiceSpy = TestBed.inject(UsersService) as jasmine.SpyObj<UsersService>;
        routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
        messageServiceSpy = messageSpy;

        fixture.detectChanges();

        expect(component.isEditMode).toBeFalse();
        // Password should be required
        expect(component.userForm.controls.password.validator).toBeTruthy();

        component.userForm.setValue({
            username: 'newuser',
            name: 'New User',
            role: Role.Developer,
            description: 'desc',
            password: 'password'
        });

        usersServiceSpy.createUser.and.returnValue(of({} as any));

        component.saveUser();

        expect(usersServiceSpy.createUser).toHaveBeenCalled();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/users']);
    });
});
