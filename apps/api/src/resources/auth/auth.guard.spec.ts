import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard, IS_PUBLIC_KEY } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { jwt } from '../../../ng-reports.config.json';

describe('AuthGuard', () => {
    let guard: AuthGuard;
    let jwtService: any;
    let reflector: any;

    beforeEach(async () => {
        jwtService = {
            verifyAsync: jest.fn(),
        };
        reflector = {
            getAllAndOverride: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthGuard,
                { provide: JwtService, useValue: jwtService },
                { provide: Reflector, useValue: reflector },
            ],
        }).compile();

        guard = module.get<AuthGuard>(AuthGuard);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should return true if public metadata is set', async () => {
        reflector.getAllAndOverride.mockReturnValue(true);
        const context = createMockContext();

        const result = await guard.canActivate(context as any);
        expect(result).toBe(true);
        expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, expect.any(Array));
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
        reflector.getAllAndOverride.mockReturnValue(false);
        const context = createMockContext();

        await expect(guard.canActivate(context as any)).rejects.toThrow(UnauthorizedException);
    });

    it('should verify token and attach user to request', async () => {
        reflector.getAllAndOverride.mockReturnValue(false);
        const payload = { sub: '123', username: 'test' };
        jwtService.verifyAsync.mockResolvedValue(payload);
        const request = {
            headers: { authorization: 'Bearer valid-token' }
        };
        const context = createMockContext(request);

        const result = await guard.canActivate(context as any);
        expect(result).toBe(true);
        expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', { secret: jwt.secret });
        expect(request['user']).toEqual(payload);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
        reflector.getAllAndOverride.mockReturnValue(false);
        jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));
        const context = createMockContext({
            headers: { authorization: 'Bearer invalid-token' }
        });

        await expect(guard.canActivate(context as any)).rejects.toThrow(UnauthorizedException);
    });

    function createMockContext(request: any = { headers: {} }) {
        return {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: () => ({
                getRequest: () => request
            })
        };
    }
});
