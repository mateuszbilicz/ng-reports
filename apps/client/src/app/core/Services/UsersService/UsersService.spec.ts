import { TestBed } from '@angular/core/testing';
import { UsersService, User, UserCreate, UserUpdateInformation, UserFilteredList } from './UsersService';
import { UsersService as ApiUsersService } from '../../swagger/api/users.service';
import { of } from 'rxjs';
import { vi } from 'vitest';

describe('UsersService', () => {
    let service: UsersService;
    let apiUsersServiceSpy: any;

    const createSpyObj = (methodNames: string[]) => {
        const obj: any = {};
        for (const method of methodNames) {
            obj[method] = vi.fn();
        }
        return obj;
    };

    beforeEach(() => {
        const spy = createSpyObj(['usersControllerFindOne', 'usersControllerGetList', 'usersControllerCreateUser', 'usersControllerUpdateUser', 'usersControllerDeleteUser']);
        TestBed.configureTestingModule({
            providers: [
                UsersService,
                { provide: ApiUsersService, useValue: spy }
            ]
        });
        service = TestBed.inject(UsersService);
        apiUsersServiceSpy = TestBed.inject(ApiUsersService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get user', () => new Promise<void>((done) => {
        const user: User = {
            username: 'test',
            name: 'Test User',
            description: 'desc',
            role: 0,
            createDate: new Date(),
            isActive: true
        };
        apiUsersServiceSpy.usersControllerFindOne.mockReturnValue(of(user));

        service.getUser('test').subscribe(res => {
            expect(res).toEqual(user);
            expect(apiUsersServiceSpy.usersControllerFindOne).toHaveBeenCalledWith('test');
            done();
        });
    }));

    it('should get users list', () => new Promise<void>((done) => {
        const userList: UserFilteredList = { items: [], total: 0 };
        apiUsersServiceSpy.usersControllerGetList.mockReturnValue(of(userList));

        service.getUsers('filter', 10, 0).subscribe(res => {
            expect(res).toEqual(userList);
            expect(apiUsersServiceSpy.usersControllerGetList).toHaveBeenCalledWith('filter', 0, 10);
            done();
        });
    }));

    it('should create user', () => new Promise<void>((done) => {
        const newUser: UserCreate = {
            username: 'test',
            password: 'password',
            name: 'Test User',
            description: 'desc',
            role: 0
        };
        const createdUser: User = {
            ...newUser,
            createDate: new Date(),
            isActive: true
        } as any; // Cast to any or User if types match perfectly, User has createDate/isActive which Create doesn't

        apiUsersServiceSpy.usersControllerCreateUser.mockReturnValue(of(createdUser));

        service.createUser(newUser).subscribe(res => {
            expect(res).toEqual(createdUser);
            expect(apiUsersServiceSpy.usersControllerCreateUser).toHaveBeenCalledWith(newUser);
            done();
        });
    }));

    it('should update user', () => new Promise<void>((done) => {
        const updates: UserUpdateInformation = { name: 'New Name', description: 'New Desc', role: 1 };
        const updatedUser: User = {
            username: 'test',
            name: 'New Name',
            description: 'New Desc',
            role: 1,
            createDate: new Date(),
            isActive: true
        };
        apiUsersServiceSpy.usersControllerUpdateUser.mockReturnValue(of(updatedUser));

        service.updateUser('test', updates).subscribe(res => {
            expect(res).toEqual(updatedUser);
            expect(apiUsersServiceSpy.usersControllerUpdateUser).toHaveBeenCalledWith(updates, 'test');
            done();
        });
    }));

    it('should delete user', () => new Promise<void>((done) => {
        apiUsersServiceSpy.usersControllerDeleteUser.mockReturnValue(of(void 0));

        service.deleteUser('test').subscribe(() => {
            expect(apiUsersServiceSpy.usersControllerDeleteUser).toHaveBeenCalledWith('test');
            done();
        });
    }));
});

