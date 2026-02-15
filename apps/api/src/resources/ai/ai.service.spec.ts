import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { SystemConfigurationService } from '../system-configuration/system-configuration.service';
import { getModelToken } from '@nestjs/mongoose';
import { Project } from '../../database/schemas/project.schema';
import { Report } from '../../database/schemas/report.schema';
import { Comment } from '../../database/schemas/comment.schema';
import { BehaviorSubject } from 'rxjs';

describe('AiService', () => {
    let service: AiService;

    const mockSystemConfigService = {
        config: new BehaviorSubject({}),
        getConfigRaw: vi.fn().mockReturnValue({}),
    };

    const mockModel = {
        find: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue([]) }),
        findOne: vi.fn().mockReturnValue({ exec: vi.fn().mockResolvedValue(null) }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiService,
                {
                    provide: SystemConfigurationService,
                    useValue: mockSystemConfigService,
                },
                {
                    provide: getModelToken(Project.name),
                    useValue: mockModel,
                },
                {
                    provide: getModelToken(Report.name),
                    useValue: mockModel,
                },
                {
                    provide: getModelToken(Comment.name),
                    useValue: mockModel,
                },
            ],
        }).compile();

        service = module.get<AiService>(AiService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
