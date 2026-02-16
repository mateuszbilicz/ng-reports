import {Test, TestingModule} from '@nestjs/testing';
import {AuthController} from './auth.controller';
import {AuthService} from './auth.service';
import {of} from 'rxjs';
import {JwtService} from '@nestjs/jwt';
import {Reflector} from '@nestjs/core';
import {AuthGuard} from './auth.guard';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: any;

    beforeEach(async () => {
        authService = {
            login: jest.fn(),
            refresh: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {provide: AuthService, useValue: authService},
                {provide: AuthGuard, useValue: {canActivate: () => true}},
                {provide: JwtService, useValue: {verifyAsync: jest.fn()}},
                {provide: Reflector, useValue: {getAllAndOverride: jest.fn()}},
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return self user from request', () => {
        const req = {user: {username: 'test'}};
        expect(controller.getUser(req)).toEqual(req.user);
    });

    it('should login', () => {
        const loginData = {username: 'test', password: 'password'};
        authService.login.mockReturnValue(of({accessToken: 'at', refreshToken: 'rt'}));

        controller.login(loginData);
        expect(authService.login).toHaveBeenCalledWith('test', 'password');
    });

    it('should refresh token', () => {
        const refreshData = {string: 'refresh-token'};
        authService.refresh.mockReturnValue(of({accessToken: 'at', refreshToken: 'rt'}));

        controller.refreshToken(refreshData);
        expect(authService.refresh).toHaveBeenCalledWith('refresh-token');
    });
});
