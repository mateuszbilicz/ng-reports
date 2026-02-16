import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { getModelToken } from '@nestjs/mongoose';
import { Report } from '../../database/schemas/report.schema';
import { Project } from '../../database/schemas/project.schema';
import { Environment } from '../../database/schemas/environment.schema';
import { of } from 'rxjs';

describe('StatisticsService', () => {
    let service: StatisticsService;
    let reportModel: any;
    let projectModel: any;
    let environmentModel: any;

    beforeEach(async () => {
        reportModel = {
            find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
            aggregate: jest.fn().mockResolvedValue([]),
            countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
        };
        projectModel = {
            findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
            countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
        };
        environmentModel = {
            find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
            findOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StatisticsService,
                { provide: getModelToken(Report.name), useValue: reportModel },
                { provide: getModelToken(Project.name), useValue: projectModel },
                { provide: getModelToken(Environment.name), useValue: environmentModel },
            ],
        }).compile();

        service = module.get<StatisticsService>(StatisticsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should get statistics', (done) => {
        const dateFrom = new Date();
        const dateTo = new Date();
        reportModel.find.mockReturnValue({ exec: jest.fn().mockResolvedValue([{ _id: 'rid' }]) });
        reportModel.aggregate.mockResolvedValue([{ label: '2023-01-01', value: 10 }]);
        reportModel.countDocuments.mockReturnValue({ exec: jest.fn().mockResolvedValue(10) });

        service.getStatistics('day', dateFrom, dateTo).subscribe((result) => {
            expect(result.totalReports).toBe(10);
            expect(result.samples).toHaveLength(1);
            done();
        });
    });
});
