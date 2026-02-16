import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { of } from 'rxjs';

describe('AuthService', () => {
    let service: AuthService;
    let usersService: any;
    let jwtService: any;

    beforeEach(async () => {
        usersService = {
            getAuth: jest.fn(),
            get: jest.fn(),
        };
        jwtService = {
            signAsync: jest.fn(),
            verify: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: UsersService, useValue: usersService },
                { provide: JwtService, useValue: jwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should login and return tokens', (done) => {
        const user = { username: 'test', role: 1, isActive: true };
        usersService.getAuth.mockReturnValue(of(user));
        jwtService.signAsync.mockResolvedValue('token');

        service.login('test', 'pass').subscribe((result) => {
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('refreshToken');
            expect(result.accessToken).toBe('token');
            expect(usersService.getAuth).toHaveBeenCalledWith('test', 'pass');
            done();
        });
    });

    it('should refresh tokens', (done) => {
        const decoded = { username: 'test', expiresAt: new Date(Date.now() + 10000).toISOString() };
        const user = { username: 'test', role: 1, isActive: true };

        jwtService.verify.mockReturnValue(decoded);
        usersService.get.mockReturnValue(of(user));
        jwtService.signAsync.mockResolvedValue('new-token');

        service.refresh('refresh-token').subscribe((result) => {
            expect(result).toHaveProperty('accessToken');
            expect(result.accessToken).toBe('new-token');
            expect(jwtService.verify).toHaveBeenCalledWith('refresh-token');
            done();
        });
    });

    it('should throw error if refresh token expired', (done) => {
        const decoded = { username: 'test', expiresAt: new Date(Date.now() - 10000).toISOString() };
        jwtService.verify.mockReturnValue(decoded);

        service.refresh('expired-token').subscribe({
            error: (err) => {
                expect(err.message).toBe('Refresh token expired');
                done();
            }
        });
    });
});
