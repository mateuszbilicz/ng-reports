import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {Project} from '../../swagger/model/project';
import {CreateProject} from '../../swagger/model/createProject';
import {UpdateProject} from '../../swagger/model/updateProject';
import {CreateEnvironment} from '../../swagger/model/createEnvironment';
import {Environment} from '../../swagger/model/environment';
import {ProjectsService as ApiProjectsService} from '../../swagger/api/projects.service';
import {EnvironmentsService as ApiEnvironmentsService} from '../../swagger/api/environments.service';
import {UpdateEnvironment} from '../../swagger';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  protected readonly apiProjectsService = inject(ApiProjectsService);
  protected readonly apiEnvironmentsService = inject(ApiEnvironmentsService);

  projectsControllerFindAll(filter?: string, limit?: number, skip?: number): Observable<any> {
    return this.apiProjectsService.projectsControllerFindAll(filter, limit, skip);
  }

  getProjects(filter?: string, limit?: number, skip?: number): Observable<any> {
    return this.apiProjectsService.projectsControllerFindAll(filter, limit, skip);
  }

  getProject(projectId: string): Observable<Project> {
    return this.apiProjectsService.projectsControllerFindOne(projectId);
  }

  createProject(project: CreateProject): Observable<Project> {
    return this.apiProjectsService.projectsControllerCreate(project);
  }

  updateProject(projectId: string, updates: UpdateProject): Observable<Project> {
    return this.apiProjectsService.projectsControllerUpdate(updates, projectId);
  }

  deleteProject(projectId: string): Observable<Project> {
    return this.apiProjectsService.projectsControllerRemove(projectId);
  }

  createEnvironment(environment: CreateEnvironment): Observable<Environment> {
    return this.apiEnvironmentsService.environmentsControllerCreate(environment);
  }

  deleteEnvironment(environmentId: string): Observable<Environment> {
    return this.apiEnvironmentsService.environmentsControllerRemove(environmentId);
  }

  updateEnvironment(environmentId: string, updates: UpdateEnvironment): Observable<Environment> {
    return this.apiEnvironmentsService.environmentsControllerUpdate(updates, environmentId);
  }

  getEnvironments(projectId: string, filter?: string, limit?: number, skip?: number): Observable<any> {
    return this.apiEnvironmentsService.environmentsControllerFindAll(projectId, filter, limit, skip);
  }
}
