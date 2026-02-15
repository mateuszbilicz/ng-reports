import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';
import { CanActivate } from '@nestjs/common';

describe('ReportsController', () => {
    let controller: ReportsController;

    const mockReportsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        changeSeverity: jest.fn(),
        changeFixed: jest.fn(),
        remove: jest.fn(),
        readStream: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ReportsController],
            providers: [
                {
                    provide: ReportsService,
                    useValue: mockReportsService,
                },
            ],
        })
            .overrideGuard(AuthGuard)
            .useValue({ canActivate: jest.fn(() => true) } as CanActivate)
            .compile();

        controller = module.get<ReportsController>(ReportsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
