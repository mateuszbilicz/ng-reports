jest.mock('nanoid', () => ({ nanoid: () => 'id' }));
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getModelToken } from '@nestjs/mongoose';
import { Project } from '../../database/schemas/project.schema';
import { of } from 'rxjs';

describe('ProjectsService', () => {
    let service: ProjectsService;
    let model: any;

    beforeEach(async () => {
        const mockQuery = (val) => {
            const query = {
                exec: jest.fn().mockResolvedValue(val),
                then: (cb) => Promise.resolve(val).then(cb),
                populate: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
            };
            return query;
        };

        model = jest.fn().mockImplementation((dto) => ({
            ...dto,
            save: jest.fn().mockResolvedValue({ ...dto, _id: 'pid' }),
        }));
        (model as any).find = jest.fn().mockReturnValue(mockQuery([]));
        (model as any).findOne = jest.fn().mockReturnValue(mockQuery(null));
        (model as any).updateOne = jest.fn().mockReturnValue(mockQuery({}));
        (model as any).findOneAndDelete = jest.fn().mockReturnValue(mockQuery({}));
        (model as any).countDocuments = jest.fn().mockReturnValue(mockQuery(0));

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectsService,
                { provide: getModelToken(Project.name), useValue: model },
            ],
        }).compile();

        service = module.get<ProjectsService>(ProjectsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a project', (done) => {
        const dto = { projectId: 'p1', name: 'P1', description: 'desc' };

        service.create(dto).subscribe((result) => {
            expect(result.projectId).toBe('p1');
            expect(model).toHaveBeenCalled();
            done();
        });
    });

    it('should list projects', (done) => {
        const projects = [{ projectId: 'p1' }];
        const mockQuery = (val) => ({
            exec: jest.fn().mockResolvedValue(val),
            then: (cb) => Promise.resolve(val).then(cb),
        });
        (model.find as jest.Mock).mockReturnValue(mockQuery(projects));
        (model.countDocuments as jest.Mock).mockReturnValue(mockQuery(1));

        service.findAll(0, 10, '').subscribe((result) => {
            expect(result.items).toHaveLength(1);
            done();
        });
    });

    it('should get a project', (done) => {
        const project = { projectId: 'p1' };
        const mockQuery = (val) => ({
            exec: jest.fn().mockResolvedValue(val),
            then: (cb) => Promise.resolve(val).then(cb),
            populate: jest.fn().mockReturnThis(),
        });
        (model.findOne as jest.Mock).mockReturnValue(mockQuery(project));

        service.findOne('p1').subscribe((result) => {
            expect(result).toEqual(project);
            done();
        });
    });

    it('should delete a project', (done) => {
        const mockQuery = (val) => ({
            exec: jest.fn().mockResolvedValue(val),
            then: (cb) => Promise.resolve(val).then(cb),
        });
        (model.findOneAndDelete as jest.Mock).mockReturnValue(mockQuery({ deletedCount: 1 }));

        service.remove('p1').subscribe((result) => {
            expect(result).toBeDefined();
            done();
        });
    });
});
