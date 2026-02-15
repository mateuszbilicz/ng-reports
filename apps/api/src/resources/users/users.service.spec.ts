import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../database/schemas/user.schema';
import { of } from 'rxjs';

vi.mock('../../global/rx-argon', () => {
    const { of } = require('rxjs');
    return {
        argon2Hash: vi.fn().mockReturnValue(of('hashed')),
        argon2Verify: vi.fn().mockReturnValue(of(true)),
    };
});

describe('UsersService', () => {
    let service: UsersService;

    const mockQuery = (val: any) => {
        const p = Promise.resolve(val);
        (p as any).exec = vi.fn().mockResolvedValue(val);
        return p;
    };

    const mockUserModel = {
        findOne: vi.fn().mockReturnValue(mockQuery(null)),
        create: vi.fn().mockResolvedValue({ _id: 'mock-id' }),
        updateOne: vi.fn().mockReturnValue(mockQuery({})),
        deleteOne: vi.fn().mockReturnValue(mockQuery({})),
        find: vi.fn().mockReturnValue(mockQuery([])),
        countDocuments: vi.fn().mockReturnValue(mockQuery(0)),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUserModel,
                }
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
