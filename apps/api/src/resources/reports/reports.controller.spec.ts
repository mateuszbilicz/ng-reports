import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../auth/auth.guard';
import { CanActivate } from '@nestjs/common';

describe('ReportsController', () => {
    let controller: ReportsController;

    const mockReportsService = {
        create: vi.fn(),
        findAll: vi.fn(),
        findOne: vi.fn(),
        update: vi.fn(),
        changeSeverity: vi.fn(),
        changeFixed: vi.fn(),
        remove: vi.fn(),
        readStream: vi.fn(),
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
            .useValue({ canActivate: vi.fn(() => true) } as CanActivate)
            .compile();

        controller = module.get<ReportsController>(ReportsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
