import {Test, TestingModule} from '@nestjs/testing';
import {AiService} from './ai.service';
import {getModelToken} from '@nestjs/mongoose';
import {Project} from '../../database/schemas/project.schema';
import {Report} from '../../database/schemas/report.schema';
import {Comment} from '../../database/schemas/comment.schema';
import {SystemConfigurationService} from '../system-configuration/system-configuration.service';
import {BehaviorSubject} from 'rxjs';

describe('AiService', () => {
    let service: AiService;
    let reportModel: any;
    let systemConfigurationService: any;

    beforeEach(async () => {
        systemConfigurationService = {
            config: new BehaviorSubject({enableAISummary: true}),
        };
        reportModel = {
            findOne: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
                then: jest.fn().mockImplementation(cb => Promise.resolve(null).then(cb)),
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiService,
                {provide: SystemConfigurationService, useValue: systemConfigurationService},
                {provide: getModelToken(Project.name), useValue: {}},
                {provide: getModelToken(Report.name), useValue: reportModel},
                {provide: getModelToken(Comment.name), useValue: {}},
            ],
        }).compile();

        service = module.get<AiService>(AiService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should not process if AI summary is disabled', (done) => {
        systemConfigurationService.config.next({enableAISummary: false});
        service.processReport('r1').subscribe((result) => {
            expect(result.summary).toBeUndefined();
            done();
        });
    });

    it('should add to queue if enabled', () => {
        const spy = jest.spyOn(service.queue, 'addTask');
        service.addProcessReportToQueue('r1');
        expect(spy).toHaveBeenCalledWith('r1', expect.any(Object));
    });
});
