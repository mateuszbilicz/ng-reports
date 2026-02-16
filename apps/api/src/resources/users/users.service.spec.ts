jest.mock('nanoid', () => ({ nanoid: () => 'id' }));
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../database/schemas/user.schema';
import { of } from 'rxjs';
import * as rxArgon from '../../global/rx-argon';

jest.mock('../../global/rx-argon', () => {
    const { of } = require('rxjs');
    return {
        argon2Hash: jest.fn().mockReturnValue(of('hashed')),
        argon2Verify: jest.fn().mockReturnValue(of(true)),
    };
});

describe('UsersService', () => {
    let service: UsersService;
    let model: any;

    beforeEach(async () => {
        model = {
            findOne: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
                then: jest.fn().mockImplementation(cb => Promise.resolve(null).then(cb)),
            }),
            create: jest.fn().mockImplementation((dto) => Promise.resolve({ ...dto, _id: 'id' })),
            updateOne: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue({}),
                then: jest.fn().mockImplementation(cb => Promise.resolve({}).then(cb)),
            }),
            deleteOne: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue({}),
                then: jest.fn().mockImplementation(cb => Promise.resolve({}).then(cb)),
            }),
            find: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
                then: jest.fn().mockImplementation(cb => Promise.resolve([]).then(cb)),
            }),
            countDocuments: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(0),
                then: jest.fn().mockImplementation(cb => Promise.resolve(0).then(cb)),
            }),
        };

        // Mock findOne for the constructor calls
        // Mock findOne for the constructor calls
        model.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue({ username: 'admin' }),
            then: jest.fn().mockImplementation(cb => Promise.resolve({ username: 'admin' }).then(cb)),
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                { provide: getModelToken(User.name), useValue: model },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a user', (done) => {
        const dto = { username: 'new', password: 'password', name: 'New', description: 'desc', role: 'Developer' as any };
        model.create.mockResolvedValue({ ...dto, _id: 'id' });

        service.create(dto).subscribe((result) => {
            expect(result.username).toBe('new');
            expect(model.create).toHaveBeenCalled();
            done();
        });
    });

    it('should get user by username', (done) => {
        const user = { username: 'test' };
        model.findOne.mockReturnValue({
            then: cb => Promise.resolve(user).then(cb)
        });

        service.get('test').subscribe((result) => {
            expect(result).toEqual(user);
            done();
        });
    });

    it('should authenticate user', (done) => {
        const user = { username: 'test', password: 'hashed', isActive: true, role: 'Developer' };
        model.findOne.mockReturnValue({
            then: cb => Promise.resolve(user).then(cb)
        });
        (rxArgon.argon2Verify as jest.Mock).mockReturnValue(of(true));

        service.getAuth('test', 'password').subscribe((result) => {
            expect(result.username).toBe('test');
            done();
        });
    });

    it('should list users', (done) => {
        const users = [{ username: 'u1' }];
        model.find.mockReturnValue({
            then: cb => Promise.resolve(users).then(cb)
        });
        model.countDocuments.mockReturnValue({
            then: cb => Promise.resolve(1).then(cb)
        });

        service.listUsers('', 0, 10).subscribe((result) => {
            expect(result.items).toHaveLength(1);
            expect(result.totalItemsCount).toBe(1);
            done();
        });
    });
});
