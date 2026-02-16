import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { of } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '../auth/auth.guard';

describe('UsersController', () => {
    let controller: UsersController;
    let service: any;

    beforeEach(async () => {
        service = {
            create: jest.fn(),
            updateInformation: jest.fn(),
            updatePassword: jest.fn(),
            setActive: jest.fn(),
            deleteUser: jest.fn(),
            listUsers: jest.fn(),
            get: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [
                { provide: UsersService, useValue: service },
                { provide: AuthGuard, useValue: { canActivate: () => true } },
                { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
                { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
            ],
        }).compile();

        controller = module.get<UsersController>(UsersController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create user', () => {
        const dto = { username: 'test' };
        service.create.mockReturnValue(of(dto));
        controller.createUser(dto as any);
        expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should list users', () => {
        service.listUsers.mockReturnValue(of({ items: [], totalItemsCount: 0 }));
        controller.getList('', 0, 10);
        expect(service.listUsers).toHaveBeenCalledWith('', 0, 10);
    });

    it('should get user', () => {
        service.get.mockReturnValue(of({ username: 'test' }));
        controller.findOne('test');
        expect(service.get).toHaveBeenCalledWith('test');
    });

    it('should delete user', () => {
        service.deleteUser.mockReturnValue(of({ deletedCount: 1 }));
        controller.deleteUser('test');
        expect(service.deleteUser).toHaveBeenCalledWith('test');
    });
});
