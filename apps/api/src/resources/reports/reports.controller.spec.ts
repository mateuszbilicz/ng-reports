import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { of } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '../auth/auth.guard';

describe('ReportsController', () => {
    let controller: ReportsController;
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
            controllers: [ReportsController],
            providers: [
                { provide: ReportsService, useValue: service },
                { provide: AuthGuard, useValue: { canActivate: () => true } },
                { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
                { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
            ],
        }).compile();

        controller = module.get<ReportsController>(ReportsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create report', () => {
        const dto = { title: 'R1' };
        service.create.mockReturnValue(of(dto));
        controller.create('e1', dto as any);
        expect(service.create).toHaveBeenCalledWith(dto, 'e1');
    });

    it('should list reports', () => {
        service.findAll.mockReturnValue(of({ items: [], totalItemsCount: 0 }));
        controller.findAll('e1', 0, 10, '');
        expect(service.findAll).toHaveBeenCalledWith('e1', 0, 10, '');
    });

    it('should get report', () => {
        service.findOne.mockReturnValue(of({ title: 'R1' }));
        controller.findOne('r1');
        expect(service.findOne).toHaveBeenCalledWith('r1');
    });

    it('should update report', () => {
        const dto = { title: 'R2' };
        service.update.mockReturnValue(of({ title: 'R2' }));
        controller.update('r1', dto);
        expect(service.update).toHaveBeenCalledWith('r1', dto);
    });

    it('should remove report', () => {
        service.remove.mockReturnValue(of({ title: 'R1' }));
        controller.remove('r1');
        expect(service.remove).toHaveBeenCalledWith('r1');
    });
});
