jest.mock('nanoid', () => ({ nanoid: () => 'id' }));
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { of } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '../auth/auth.guard';

describe('ProjectsController', () => {
    let controller: ProjectsController;
    let service: any;

    beforeEach(async () => {
        service = {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProjectsController],
            providers: [
                { provide: ProjectsService, useValue: service },
                { provide: AuthGuard, useValue: { canActivate: () => true } },
                { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
                { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
            ],
        }).compile();

        controller = module.get<ProjectsController>(ProjectsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create project', () => {
        const dto = { projectId: 'p1', name: 'P1' };
        service.create.mockReturnValue(of(dto));
        controller.create(dto as any);
        expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should list projects', () => {
        service.findAll.mockReturnValue(of({ items: [], totalItemsCount: 0 }));
        controller.findAll(0, 10, '');
        expect(service.findAll).toHaveBeenCalledWith(0, 10, '');
    });

    it('should get project', () => {
        service.findOne.mockReturnValue(of({ projectId: 'p1' }));
        controller.findOne('p1');
        expect(service.findOne).toHaveBeenCalledWith('p1');
    });

    it('should update project', () => {
        const dto = { name: 'P2' };
        service.update.mockReturnValue(of({ matchedCount: 1 }));
        controller.update('p1', dto);
        expect(service.update).toHaveBeenCalledWith('p1', dto);
    });

    it('should delete project', () => {
        service.remove.mockReturnValue(of({ deletedCount: 1 }));
        controller.remove('p1');
        expect(service.remove).toHaveBeenCalledWith('p1');
    });
});
