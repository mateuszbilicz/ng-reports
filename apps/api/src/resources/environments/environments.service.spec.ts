import { Test, TestingModule } from '@nestjs/testing';
import { EnvironmentsService } from './environments.service';
import { getModelToken } from '@nestjs/mongoose';
import { Environment } from '../../database/schemas/environment.schema';
import { Project } from '../../database/schemas/project.schema';
import { ProjectsService } from '../projects/projects.service';
import { of } from 'rxjs';

describe('EnvironmentsService', () => {
    let service: EnvironmentsService;

    const mockQuery = (val: any) => {
        const p = Promise.resolve(val);
        (p as any).exec = vi.fn().mockResolvedValue(val);
        return p;
    };

    class MockEnvironmentModel {
        constructor(private data: any) {
            Object.assign(this, data);
        }
        _id = 'mock-env-id';
        save = vi.fn().mockResolvedValue({ ...this.data, _id: 'mock-env-id' });
        static findOne = vi.fn().mockReturnValue(mockQuery(null));
        static create = vi.fn().mockResolvedValue({ _id: 'mock-env-id' });
        static updateOne = vi.fn().mockReturnValue(mockQuery({}));
        static findOneAndUpdate = vi.fn().mockReturnValue(mockQuery(null));
        static findOneAndDelete = vi.fn().mockReturnValue(mockQuery({ _id: 'mock-env-id' }));
        static find = vi.fn().mockReturnValue(mockQuery([]));
        static countDocuments = vi.fn().mockReturnValue(mockQuery(0));
    }

    const mockProjectModel = {
        countDocuments: vi.fn().mockReturnValue(mockQuery(0)),
        findOne: vi.fn().mockReturnValue(mockQuery(null)),
        updateOne: vi.fn().mockReturnValue(mockQuery({})),
    };

    const mockProjectsService = {
        create: vi.fn().mockReturnValue(of({})),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EnvironmentsService,
                {
                    provide: getModelToken(Environment.name),
                    useValue: MockEnvironmentModel,
                },
                {
                    provide: getModelToken(Project.name),
                    useValue: mockProjectModel,
                },
                {
                    provide: ProjectsService,
                    useValue: mockProjectsService,
                },
            ],
        }).compile();

        service = module.get<EnvironmentsService>(EnvironmentsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
