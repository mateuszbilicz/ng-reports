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
import { vi } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('ProjectsService', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch { }
    });

    let service: ProjectsService;
    let apiProjectsServiceSpy: any;
    let apiEnvironmentsServiceSpy: any;

    const createSpyObj = (methodNames: string[]) => {
        const obj: any = {};
        for (const method of methodNames) {
            obj[method] = vi.fn();
        }
        return obj;
    };

    beforeEach(() => {
        const projSpy = createSpyObj(['projectsControllerFindAll', 'projectsControllerFindOne', 'projectsControllerCreate', 'projectsControllerUpdate', 'projectsControllerRemove']);
        const envSpy = createSpyObj(['environmentsControllerCreate', 'environmentsControllerRemove', 'environmentsControllerUpdate', 'environmentsControllerFindAll']);
        apiProjectsServiceSpy = projSpy;
        apiEnvironmentsServiceSpy = envSpy;

        TestBed.configureTestingModule({
            providers: [
                ProjectsService,
                { provide: ApiProjectsService, useValue: apiProjectsServiceSpy },
                { provide: ApiEnvironmentsService, useValue: apiEnvironmentsServiceSpy }
            ]
        });
        service = TestBed.inject(ProjectsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Projects', () => {
        it('should get all projects', () => new Promise<void>((done) => {
            const projects: Project[] = [{
              createDate: new Date(),
              description: '',
              environments: [],
              name: '1',
              projectId: '1'
            }];
            apiProjectsServiceSpy.projectsControllerFindAll.mockReturnValue(of(projects));

            service.getProjects().subscribe(res => {
                expect(res).toEqual(projects);
                expect(apiProjectsServiceSpy.projectsControllerFindAll).toHaveBeenCalled();
                done();
            });
        }));

        it('should get one project', () => new Promise<void>((done) => {
            const project: Project = {
              createDate: new Date(),
              description: '',
              environments: [],
              name: '1',
              projectId: '1'
            };
            apiProjectsServiceSpy.projectsControllerFindOne.mockReturnValue(of(project));

            service.getProject('1').subscribe(res => {
                expect(res).toEqual(project);
                expect(apiProjectsServiceSpy.projectsControllerFindOne).toHaveBeenCalledWith('1');
                done();
            });
        }));

        it('should create project', () => new Promise<void>((done) => {
            const newProject: CreateProject = {description: '', projectId: '1', name: 'p1' };
            const project: Project = {
              createDate: new Date(),
              environments: [],
              ...newProject
            };
            apiProjectsServiceSpy.projectsControllerCreate.mockReturnValue(of(project));

            service.createProject(newProject).subscribe(res => {
                expect(res).toEqual(project);
                expect(apiProjectsServiceSpy.projectsControllerCreate).toHaveBeenCalledWith(newProject);
                done();
            });
        }));

        it('should update project', () => new Promise<void>((done) => {
            const update: UpdateProject = { name: 'updated' };
            const project: Project = {
              createDate: new Date(),
              description: '',
              environments: [],
              name: 'updated',
              projectId: '1'
            };
            apiProjectsServiceSpy.projectsControllerUpdate.mockReturnValue(of(project));

            service.updateProject('1', update).subscribe(res => {
                expect(res).toEqual(project);
                expect(apiProjectsServiceSpy.projectsControllerUpdate).toHaveBeenCalledWith(update, '1');
                done();
            });
        }));

        it('should delete project', () => new Promise<void>((done) => {
            const project: Project = {
              createDate: new Date(),
              description: '',
              environments: [],
              name: '1',
              projectId: '1'
            };
            apiProjectsServiceSpy.projectsControllerRemove.mockReturnValue(of(project));

            service.deleteProject('1').subscribe(res => {
                expect(res).toEqual(project);
                expect(apiProjectsServiceSpy.projectsControllerRemove).toHaveBeenCalledWith('1');
                done();
            });
        }));
    });

    describe('Environments', () => {
        it('should create environment', () => new Promise<void>((done) => {
            const newEnv: CreateEnvironment = {description: '', environmentId: '1', name: 'env1', projectId: 'p1', urls: [] };
            const env: Environment = {reports: [], ...newEnv };
            apiEnvironmentsServiceSpy.environmentsControllerCreate.mockReturnValue(of(env));

            service.createEnvironment(newEnv).subscribe(res => {
                expect(res).toEqual(env);
                expect(apiEnvironmentsServiceSpy.environmentsControllerCreate).toHaveBeenCalledWith(newEnv);
                done();
            });
        }));

        it('should delete environment', () => new Promise<void>((done) => {
            const env: Environment = {description: '', environmentId: '1', reports: [], urls: [], name: 'env1' };
            apiEnvironmentsServiceSpy.environmentsControllerRemove.mockReturnValue(of(env));

            service.deleteEnvironment('1').subscribe(res => {
                expect(res).toEqual(env);
                expect(apiEnvironmentsServiceSpy.environmentsControllerRemove).toHaveBeenCalledWith('1');
                done();
            });
        }));

        it('should update environment', () => new Promise<void>((done) => {
            const update: UpdateEnvironment = { name: 'Updated' };
            const env: Environment = {description: '', environmentId: '1', reports: [], urls: [], name: 'updated'};
            apiEnvironmentsServiceSpy.environmentsControllerUpdate.mockReturnValue(of(env));

            service.updateEnvironment('1', update).subscribe(res => {
                expect(res).toEqual(env);
                expect(apiEnvironmentsServiceSpy.environmentsControllerUpdate).toHaveBeenCalledWith(update, '1');
                done();
            });
        }));

        it('should get environments', () => new Promise<void>((done) => {
            const envs: Environment[] = [{description: '', environmentId: '1', reports: [], urls: [], name: '1'}];
            apiEnvironmentsServiceSpy.environmentsControllerFindAll.mockReturnValue(of(envs));

            service.getEnvironments('p1').subscribe(res => {
                expect(res).toEqual(envs);
                expect(apiEnvironmentsServiceSpy.environmentsControllerFindAll).toHaveBeenCalledWith('p1', undefined, undefined, undefined);
                done();
            });
        }));
    });
});
