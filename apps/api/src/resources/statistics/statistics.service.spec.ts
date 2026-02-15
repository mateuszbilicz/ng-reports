import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { getModelToken } from '@nestjs/mongoose';
import { Report } from '../../database/schemas/report.schema';
import { Project } from '../../database/schemas/project.schema';
import { Environment } from '../../database/schemas/environment.schema';

describe('StatisticsService', () => {
    let service: StatisticsService;

    const mockModel = {
        find: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) }),
        findOne: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(null) }),
        aggregate: vi.fn().mockReturnValue([]),
        countDocuments: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(0) }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StatisticsService,
                {
                    provide: getModelToken(Report.name),
                    useValue: mockModel,
                },
                {
                    provide: getModelToken(Project.name),
                    useValue: mockModel,
                },
                {
                    provide: getModelToken(Environment.name),
                    useValue: mockModel,
                },
            ],
        }).compile();

        service = module.get<StatisticsService>(StatisticsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
