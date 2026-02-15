import { TestBed } from '@angular/core/testing';
import { ProjectsService } from './ProjectsService';
import { ProjectsService as ApiProjectsService } from '../../swagger/api/projects.service';
import { EnvironmentsService as ApiEnvironmentsService } from '../../swagger/api/environments.service';
import { of } from 'rxjs';
import { Project } from '../../swagger/model/project';
import { CreateProject } from '../../swagger/model/createProject';
import { Environment } from '../../swagger/model/environment';
import { CreateEnvironment } from '../../swagger/model/createEnvironment';
import { UpdateProject } from '../../swagger/model/updateProject';
import { UpdateEnvironment } from '../../swagger/model/updateEnvironment';

describe('ProjectsService', () => {
    let service: ProjectsService;
    let apiProjectsServiceSpy: jasmine.SpyObj<ApiProjectsService>;
    let apiEnvironmentsServiceSpy: jasmine.SpyObj<ApiEnvironmentsService>;

    beforeEach(() => {
        const projSpy = jasmine.createSpyObj('ApiProjectsService', ['projectsControllerFindAll', 'projectsControllerFindOne', 'projectsControllerCreate', 'projectsControllerUpdate', 'projectsControllerRemove']);
        const envSpy = jasmine.createSpyObj('ApiEnvironmentsService', ['environmentsControllerCreate', 'environmentsControllerRemove', 'environmentsControllerUpdate', 'environmentsControllerFindAll']);

        TestBed.configureTestingModule({
            providers: [
                ProjectsService,
                { provide: ApiProjectsService, useValue: projSpy },
                { provide: ApiEnvironmentsService, useValue: envSpy }
            ]
        });
        service = TestBed.inject(ProjectsService);
        apiProjectsServiceSpy = TestBed.inject(ApiProjectsService) as jasmine.SpyObj<ApiProjectsService>;
        apiEnvironmentsServiceSpy = TestBed.inject(ApiEnvironmentsService) as jasmine.SpyObj<ApiEnvironmentsService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Projects', () => {
        it('should get all projects', (done) => {
            const projects: Project[] = [{ id: '1', name: 'p1', createdAt: new Date() }];
            apiProjectsServiceSpy.projectsControllerFindAll.and.returnValue(of(projects));

            service.getProjects().subscribe(res => {
                expect(res).toEqual(projects);
                expect(apiProjectsServiceSpy.projectsControllerFindAll).toHaveBeenCalled();
                done();
            });
        });

        it('should get one project', (done) => {
            const project: Project = { id: '1', name: 'p1', createdAt: new Date() };
            apiProjectsServiceSpy.projectsControllerFindOne.and.returnValue(of(project));

            service.getProject('1').subscribe(res => {
                expect(res).toEqual(project);
                expect(apiProjectsServiceSpy.projectsControllerFindOne).toHaveBeenCalledWith('1');
                done();
            });
        });

        it('should create project', (done) => {
            const newProject: CreateProject = { name: 'p1' };
            const project: Project = { id: '1', ...newProject, createdAt: new Date() };
            apiProjectsServiceSpy.projectsControllerCreate.and.returnValue(of(project));

            service.createProject(newProject).subscribe(res => {
                expect(res).toEqual(project);
                expect(apiProjectsServiceSpy.projectsControllerCreate).toHaveBeenCalledWith(newProject);
                done();
            });
        });

        it('should update project', (done) => {
            const update: UpdateProject = { name: 'updated' };
            const project: Project = { id: '1', name: 'updated', createdAt: new Date() };
            apiProjectsServiceSpy.projectsControllerUpdate.and.returnValue(of(project));

            service.updateProject('1', update).subscribe(res => {
                expect(res).toEqual(project);
                expect(apiProjectsServiceSpy.projectsControllerUpdate).toHaveBeenCalledWith(update, '1');
                done();
            });
        });

        it('should delete project', (done) => {
            const project: Project = { id: '1', name: 'p1', createdAt: new Date() };
            apiProjectsServiceSpy.projectsControllerRemove.and.returnValue(of(project));

            service.deleteProject('1').subscribe(res => {
                expect(res).toEqual(project);
                expect(apiProjectsServiceSpy.projectsControllerRemove).toHaveBeenCalledWith('1');
                done();
            });
        });
    });

    describe('Environments', () => {
        it('should create environment', (done) => {
            const newEnv: CreateEnvironment = { name: 'env1', projectId: 'p1', label: 'Env 1' };
            const env: Environment = { id: '1', ...newEnv };
            apiEnvironmentsServiceSpy.environmentsControllerCreate.and.returnValue(of(env));

            service.createEnvironment(newEnv).subscribe(res => {
                expect(res).toEqual(env);
                expect(apiEnvironmentsServiceSpy.environmentsControllerCreate).toHaveBeenCalledWith(newEnv);
                done();
            });
        });

        it('should delete environment', (done) => {
            const env: Environment = { id: '1', name: 'env1', projectId: 'p1', label: 'Env 1' };
            apiEnvironmentsServiceSpy.environmentsControllerRemove.and.returnValue(of(env));

            service.deleteEnvironment('1').subscribe(res => {
                expect(res).toEqual(env);
                expect(apiEnvironmentsServiceSpy.environmentsControllerRemove).toHaveBeenCalledWith('1');
                done();
            });
        });

        it('should update environment', (done) => {
            const update: UpdateEnvironment = { label: 'Updated' };
            const env: Environment = { id: '1', name: 'env1', projectId: 'p1', label: 'Updated' };
            apiEnvironmentsServiceSpy.environmentsControllerUpdate.and.returnValue(of(env));

            service.updateEnvironment('1', update).subscribe(res => {
                expect(res).toEqual(env);
                expect(apiEnvironmentsServiceSpy.environmentsControllerUpdate).toHaveBeenCalledWith(update, '1');
                done();
            });
        });

        it('should get environments', (done) => {
            const envs: Environment[] = [{ id: '1', name: 'env1', projectId: 'p1', label: 'Env 1' }];
            apiEnvironmentsServiceSpy.environmentsControllerFindAll.and.returnValue(of(envs));

            service.getEnvironments('p1').subscribe(res => {
                expect(res).toEqual(envs);
                expect(apiEnvironmentsServiceSpy.environmentsControllerFindAll).toHaveBeenCalledWith('p1', undefined, undefined, undefined);
                done();
            });
        });
    });
});
