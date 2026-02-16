// @vitest-environment jsdom
import {TestBed} from '@angular/core/testing';
import {UsersService} from './UsersService';
import {UsersService as ApiUsersService} from '../../swagger/api/users.service';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';

describe('UsersService', () => {
  let service: UsersService;
  let apiServiceMock: any;

  beforeEach(() => {
    apiServiceMock = {
      usersControllerFindOne: vi.fn(),
      usersControllerGetList: vi.fn(),
      usersControllerCreateUser: vi.fn(),
      usersControllerUpdateUser: vi.fn(),
      usersControllerDeleteUser: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        UsersService,
        {provide: ApiUsersService, useValue: apiServiceMock}
      ]
    });

    service = TestBed.inject(UsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call usersControllerGetList on getUsers', () => {
    apiServiceMock.usersControllerGetList.mockReturnValue(of({}));
    service.getUsers('filter', 10, 0).subscribe();
    expect(apiServiceMock.usersControllerGetList).toHaveBeenCalledWith('filter', 0, 10);
  });
});
