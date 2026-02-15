import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Report } from '../../database/schemas/report.schema';
import { Environment } from '../../database/schemas/environment.schema';
import { Comment } from '../../database/schemas/comment.schema';
import { AiService } from '../ai/ai.service';
import { SystemConfigurationService } from '../system-configuration/system-configuration.service';
import { BehaviorSubject } from 'rxjs';

describe('ReportsService', () => {
    let service: ReportsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                {
                    provide: getModelToken(Report.name),
                    useValue: {},
                },
                {
                    provide: getModelToken(Environment.name),
                    useValue: {},
                },
                {
                    provide: getModelToken(Comment.name),
                    useValue: {},
                },
                {
                    provide: getConnectionToken(),
                    useValue: {
                        db: {},
                    },
                },
                {
                    provide: AiService,
                    useValue: {},
                },
                {
                    provide: SystemConfigurationService,
                    useValue: {
                        config: new BehaviorSubject({}),
                    },
                },
            ],
        }).compile();

        service = module.get<ReportsService>(ReportsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
