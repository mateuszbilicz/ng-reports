jest.mock('nanoid', () => ({ nanoid: () => 'id' }));
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { of } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '../auth/auth.guard';

describe('CommentsController', () => {
    let controller: CommentsController;
    let service: any;

    beforeEach(async () => {
        service = {
            create: jest.fn(),
            generateSummary: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [CommentsController],
            providers: [
                { provide: CommentsService, useValue: service },
                { provide: AuthGuard, useValue: { canActivate: () => true } },
                { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
                { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
            ],
        }).compile();

        controller = module.get<CommentsController>(CommentsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create comment', () => {
        const req = { user: { username: 'user1' } };
        const dto = { reportId: 'r1', content: 'C1' };
        service.create.mockReturnValue(of(dto));
        controller.create(dto as any, req as any);
        expect(service.create).toHaveBeenCalledWith(dto, req.user.username);
    });

    it('should request AI summary', () => {
        const req = { user: { username: 'user1' } };
        const dto = { reportId: 'r1' };
        service.generateSummary.mockReturnValue(of({ content: 'AI' }));
        controller.requestAiSummary(dto as any, req as any);
        expect(service.generateSummary).toHaveBeenCalledWith(dto, req.user.username);
    });

    it('should list comments', () => {
        service.findAll.mockReturnValue(of({ items: [], totalItemsCount: 0 }));
        controller.findAll('r1', 0, 10);
        expect(service.findAll).toHaveBeenCalledWith('r1', 0, 10, '', undefined, undefined);
    });
});
