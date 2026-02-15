import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { of } from 'rxjs';



describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        getAuth: vi.fn().mockReturnValue(of({})),
                        get: vi.fn().mockReturnValue(of({})),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: vi.fn().mockResolvedValue('token'),
                        verify: vi.fn().mockReturnValue({}),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
