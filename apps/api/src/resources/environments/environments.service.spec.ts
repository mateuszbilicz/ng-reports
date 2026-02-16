import { Test, TestingModule } from '@nestjs/testing';
import { EnvironmentsService } from './environments.service';
import { getModelToken } from '@nestjs/mongoose';
import { Environment } from '../../database/schemas/environment.schema';
import { Project } from '../../database/schemas/project.schema';
import { ProjectsService } from '../projects/projects.service';
import { of } from 'rxjs';

describe('EnvironmentsService', () => {
    let service: EnvironmentsService;
    let environmentModel: any;
    let projectModel: any;
    let projectsService: any;

    beforeEach(async () => {
        const mockQuery = (val) => ({
            exec: jest.fn().mockResolvedValue(val),
            then: (cb) => Promise.resolve(val).then(cb),
        });

        const mockEnv = {
            save: jest.fn().mockResolvedValue({ _id: 'eid', environmentId: 'e1' }),
            _id: 'eid',
        };
        environmentModel = jest.fn().mockImplementation(() => mockEnv);
        (environmentModel as any).find = jest.fn().mockReturnValue(mockQuery([]));
        (environmentModel as any).findOne = jest.fn().mockReturnValue(mockQuery(null));
        (environmentModel as any).findOneAndUpdate = jest.fn().mockReturnValue(mockQuery(null));
        (environmentModel as any).findOneAndDelete = jest.fn().mockReturnValue(mockQuery(null));
        (environmentModel as any).countDocuments = jest.fn().mockReturnValue(mockQuery(0));

        projectModel = {
            findOne: jest.fn().mockReturnValue(mockQuery({ _id: 'pid', environments: [] })),
            updateOne: jest.fn().mockReturnValue(mockQuery({})),
            countDocuments: jest.fn().mockReturnValue(mockQuery(1)),
        };

        projectsService = {
            create: jest.fn().mockReturnValue(of({})),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EnvironmentsService,
                { provide: getModelToken(Environment.name), useValue: environmentModel },
                { provide: getModelToken(Project.name), useValue: projectModel },
                { provide: ProjectsService, useValue: projectsService },
            ],
        }).compile();

        service = module.get<EnvironmentsService>(EnvironmentsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create environment', (done) => {
        const dto = { projectId: 'p1', environmentId: 'e1', name: 'E1', description: 'desc', urls: [] };

        service.create(dto).subscribe((result) => {
            expect(result.environmentId).toBe('e1');
            expect(environmentModel).toHaveBeenCalledWith(dto);
            expect(projectModel.updateOne).toHaveBeenCalled();
            done();
        });
    });

    it('should list environments', (done) => {
        const envs = [{ name: 'E1' }];
        (environmentModel as any).find.mockReturnValue({
            exec: jest.fn().mockResolvedValue(envs),
            then: (cb) => Promise.resolve(envs).then(cb),
        });
        projectModel.countDocuments.mockReturnValue({
            exec: jest.fn().mockResolvedValue(1),
            then: (cb) => Promise.resolve(1).then(cb),
        });

        service.findAll('p1', 0, 10, '').subscribe((result) => {
            expect(result.items).toHaveLength(1);
            done();
        });
    });

    it('should get environment', (done) => {
        const env = { environmentId: 'e1' };
        (environmentModel as any).findOne.mockReturnValue({
            exec: jest.fn().mockResolvedValue(env),
            then: (cb) => Promise.resolve(env).then(cb),
        });

        service.findOne('e1').subscribe((result) => {
            expect(result.environmentId).toBe('e1');
            done();
        });
    });

    it('should update environment', (done) => {
        const dto = { name: 'E2' };
        const updatedEnv = { environmentId: 'e1', name: 'E2' };
        (environmentModel as any).findOneAndUpdate.mockReturnValue({
            exec: jest.fn().mockResolvedValue(updatedEnv),
            then: (cb) => Promise.resolve(updatedEnv).then(cb),
        });

        service.update('e1', dto).subscribe((result) => {
            expect(result.name).toBe('E2');
            done();
        });
    });

    it('should remove environment', (done) => {
        const env = { environmentId: 'e1' };
        (environmentModel as any).findOneAndDelete.mockReturnValue({
            exec: jest.fn().mockResolvedValue(env),
            then: (cb) => Promise.resolve(env).then(cb),
        });

        service.remove('e1').subscribe((result) => {
            expect(result.environmentId).toBe('e1');
            done();
        });
    });
});
