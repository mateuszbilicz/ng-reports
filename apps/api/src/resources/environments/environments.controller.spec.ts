jest.mock('nanoid', () => ({nanoid: () => 'id'}));
import {Test, TestingModule} from '@nestjs/testing';
import {EnvironmentsController} from './environments.controller';
import {EnvironmentsService} from './environments.service';
import {of} from 'rxjs';
import {JwtService} from '@nestjs/jwt';
import {Reflector} from '@nestjs/core';
import {AuthGuard} from '../auth/auth.guard';

describe('EnvironmentsController', () => {
    let controller: EnvironmentsController;
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
            controllers: [EnvironmentsController],
            providers: [
                {provide: EnvironmentsService, useValue: service},
                {provide: AuthGuard, useValue: {canActivate: () => true}},
                {provide: JwtService, useValue: {verifyAsync: jest.fn()}},
                {provide: Reflector, useValue: {getAllAndOverride: jest.fn()}},
            ],
        }).compile();

        controller = module.get<EnvironmentsController>(EnvironmentsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create environment', () => {
        const dto = {projectId: 'p1', environmentId: 'e1'};
        service.create.mockReturnValue(of(dto));
        controller.create(dto as any);
        expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should list environments', () => {
        service.findAll.mockReturnValue(of({items: [], totalItemsCount: 0}));
        controller.findAll('p1', 0, 10, '');
        expect(service.findAll).toHaveBeenCalledWith('p1', 0, 10, '');
    });

    it('should get environment', () => {
        service.findOne.mockReturnValue(of({environmentId: 'e1'}));
        controller.findOne('e1');
        expect(service.findOne).toHaveBeenCalledWith('e1');
    });

    it('should update environment', () => {
        const dto = {name: 'E2'};
        service.update.mockReturnValue(of({environmentId: 'e1', name: 'E2'}));
        controller.update('e1', dto);
        expect(service.update).toHaveBeenCalledWith('e1', dto);
    });

    it('should remove environment', () => {
        service.remove.mockReturnValue(of({environmentId: 'e1'}));
        controller.remove('e1');
        expect(service.remove).toHaveBeenCalledWith('e1');
    });
});
