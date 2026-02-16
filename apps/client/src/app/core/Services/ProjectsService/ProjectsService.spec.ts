// @vitest-environment jsdom
import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {ProjectsService} from './ProjectsService';
import {ProjectsService as ApiProjectsService} from '../../swagger/api/projects.service';
import {EnvironmentsService as ApiEnvironmentsService} from '../../swagger/api/environments.service';
import {beforeEach, describe, expect, it, vi} from 'vitest';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let apiProjectsServiceMock: any;
  let apiEnvironmentsServiceMock: any;

  beforeEach(() => {
    apiProjectsServiceMock = {
      projectsControllerFindAll: vi.fn(),
      projectsControllerFindOne: vi.fn(),
      projectsControllerCreate: vi.fn(),
      projectsControllerUpdate: vi.fn(),
      projectsControllerRemove: vi.fn(),
    };

    apiEnvironmentsServiceMock = {
      environmentsControllerCreate: vi.fn(),
      environmentsControllerRemove: vi.fn(),
      environmentsControllerUpdate: vi.fn(),
      environmentsControllerFindAll: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ProjectsService,
        {provide: ApiProjectsService, useValue: apiProjectsServiceMock},
        {provide: ApiEnvironmentsService, useValue: apiEnvironmentsServiceMock},
      ],
    });

    service = TestBed.inject(ProjectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call apiProjectsService.projectsControllerFindAll on getProjects', () => {
    apiProjectsServiceMock.projectsControllerFindAll.mockReturnValue(of([]));
    service.getProjects('filter', 10, 0).subscribe();
    expect(apiProjectsServiceMock.projectsControllerFindAll).toHaveBeenCalledWith('filter', 10, 0);
  });

  it('should call apiProjectsService.projectsControllerFindOne on getProject', () => {
    apiProjectsServiceMock.projectsControllerFindOne.mockReturnValue(of({}));
    service.getProject('123').subscribe();
    expect(apiProjectsServiceMock.projectsControllerFindOne).toHaveBeenCalledWith('123');
  });

  it('should call apiEnvironmentsService.environmentsControllerCreate on createEnvironment', () => {
    const env = {name: 'prod'} as any;
    apiEnvironmentsServiceMock.environmentsControllerCreate.mockReturnValue(of({}));
    service.createEnvironment(env).subscribe();
    expect(apiEnvironmentsServiceMock.environmentsControllerCreate).toHaveBeenCalledWith(env);
  });
});
