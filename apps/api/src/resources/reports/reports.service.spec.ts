import {Test, TestingModule} from '@nestjs/testing';
import {ReportsService} from './reports.service';
import {getConnectionToken, getModelToken} from '@nestjs/mongoose';
import {Report} from '../../database/schemas/report.schema';
import {Environment} from '../../database/schemas/environment.schema';
import {Comment} from '../../database/schemas/comment.schema';
import {of} from 'rxjs';
import {AiService} from '../ai/ai.service';
import {SystemConfigurationService} from '../system-configuration/system-configuration.service';

describe('ReportsService', () => {
    let service: ReportsService;
    let reportModel: any;
    let environmentModel: any;
    let commentModel: any;
    let aiService: any;
    let systemConfigurationService: any;

    beforeEach(async () => {
        reportModel = jest.fn().mockImplementation((dto) => ({
            ...dto,
            save: jest.fn().mockResolvedValue({_id: 'rid', ...dto}),
        }));
        const mockQuery = (val) => ({
            exec: jest.fn().mockResolvedValue(val),
            then: (cb) => Promise.resolve(val).then(cb),
        });

        (reportModel as any).find = jest.fn().mockReturnValue(mockQuery([]));
        (reportModel as any).findOne = jest.fn().mockReturnValue(mockQuery(null));
        (reportModel as any).findOneAndUpdate = jest.fn().mockReturnValue(mockQuery(null));
        (reportModel as any).findOneAndDelete = jest.fn().mockReturnValue(mockQuery(null));
        (reportModel as any).countDocuments = jest.fn().mockReturnValue(mockQuery(0));

        environmentModel = {
            findOne: jest.fn().mockReturnValue(mockQuery({_id: 'eid', reports: []})),
            updateOne: jest.fn().mockReturnValue(mockQuery({})),
        };

        commentModel = {
            deleteMany: jest.fn().mockReturnValue(mockQuery({})),
        };

        aiService = {
            addProcessReportToQueue: jest.fn().mockReturnValue(of({})),
        };

        systemConfigurationService = {
            config: {
                getValue: jest.fn().mockReturnValue({}),
                subscribe: jest.fn().mockImplementation((cb) => ({
                    unsubscribe: jest.fn(),
                })),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                {provide: getModelToken(Report.name), useValue: reportModel},
                {provide: getModelToken(Environment.name), useValue: environmentModel},
                {provide: getModelToken(Comment.name), useValue: commentModel},
                {provide: getConnectionToken(), useValue: {db: {}, startSession: jest.fn()}},
                {provide: AiService, useValue: aiService},
                {provide: SystemConfigurationService, useValue: systemConfigurationService},
            ],
        }).compile();

        service = module.get<ReportsService>(ReportsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a report and link to environment', (done) => {
        const dto = {title: 'R1'};
        const env = {_id: 'eid'};
        environmentModel.findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue(env),
            then: (cb) => Promise.resolve(env).then(cb),
        });
        reportModel.mockImplementation((data) => ({
            ...data,
            save: jest.fn().mockResolvedValue({_id: 'rid', ...data}),
        }));
        environmentModel.updateOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue({}),
            then: (cb) => Promise.resolve({}).then(cb),
        });

        service.create(dto as any, 'e1').subscribe((result) => {
            expect(result.title).toBe('R1');
            expect(result._id).toBe('rid');
            expect(environmentModel.updateOne).toHaveBeenCalled();
            done();
        });
    });

    it('should list reports for an environment', (done) => {
        const reports = [{title: 'R1'}];
        reportModel.find.mockReturnValue({
            exec: jest.fn().mockResolvedValue(reports),
            then: (cb) => Promise.resolve(reports).then(cb),
        });
        reportModel.countDocuments.mockReturnValue({
            exec: jest.fn().mockResolvedValue(1),
            then: (cb) => Promise.resolve(1).then(cb),
        });

        service.findAll('e1', 0, 10, '').subscribe((result) => {
            expect(result.items).toHaveLength(1);
            expect(result.totalItemsCount).toBe(1);
            done();
        });
    });
});
