import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserView as User } from '../../swagger/model/userView';
import { UserCreate } from '../../swagger/model/userCreate';
import { UserUpdateInformation } from '../../swagger/model/userUpdateInformation';
import { Model1526a5d2e8088b132e87c } from '../../swagger/model/model1526a5d2e8088b132e87c';
import { UsersService as ApiUsersService } from '../../swagger/api/users.service';

export type UserFilteredList = Model1526a5d2e8088b132e87c;
export { User, UserCreate, UserUpdateInformation };

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private apiUsersService = inject(ApiUsersService);
    private http = inject(HttpClient);

    getUser(username: string): Observable<User> {
        return this.apiUsersService.usersControllerFindOne(username);
    }

    getUsers(filter?: string, limit?: number, skip?: number): Observable<UserFilteredList> {
        return this.apiUsersService.usersControllerGetList(filter, limit, skip);
    }

    createUser(user: UserCreate): Observable<User> {
        return this.apiUsersService.usersControllerCreateUser(user);
    }

    updateUser(username: string, updates: UserUpdateInformation): Observable<User> {
        return this.apiUsersService.usersControllerUpdateUser(updates, username);
    }

    deleteUser(username: string): Observable<void> {
        return this.apiUsersService.usersControllerDeleteUser(username);
    }
}
