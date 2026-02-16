// @vitest-environment jsdom
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ProjectsViewComponent} from './projects-view.component';
import {ProjectsService} from '../../core/Services/ProjectsService/ProjectsService';
import {Router} from '@angular/router';
import {ConfirmationService, MessageService} from 'primeng/api';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';

describe('ProjectsViewComponent', () => {
  let component: ProjectsViewComponent;
  let fixture: ComponentFixture<ProjectsViewComponent>;
  let projectsServiceMock: any;
  let routerMock: any;
  let messageServiceMock: any;
  let confirmationServiceMock: any;

  beforeEach(async () => {
    projectsServiceMock = {
      getProjects: vi.fn().mockReturnValue(of({items: []})),
      deleteProject: vi.fn().mockReturnValue(of({success: true})),
      createProject: vi.fn().mockReturnValue(of({success: true})),
      updateProject: vi.fn().mockReturnValue(of({success: true})),
      createEnvironment: vi.fn().mockReturnValue(of({success: true})),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        ProjectsViewComponent,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        {provide: ProjectsService, useValue: projectsServiceMock},
        {provide: Router, useValue: routerMock},
        MessageService,
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsViewComponent);
    component = fixture.componentInstance;

    // Get real instances but spy on them
    messageServiceMock = fixture.debugElement.injector.get(MessageService);
    confirmationServiceMock = fixture.debugElement.injector.get(ConfirmationService);

    vi.spyOn(messageServiceMock, 'add');
    vi.spyOn(confirmationServiceMock, 'confirm');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects on init', () => {
    const projects = [{projectId: 'p1', name: 'Project 1'}];
    projectsServiceMock.getProjects.mockReturnValue(of({items: projects}));

    component.ngOnInit();
    fixture.detectChanges();
    expect(projectsServiceMock.getProjects).toHaveBeenCalled();
    expect(component.projects()).toEqual(projects);
  });

  it('should open new project dialog', () => {
    component.openNew();
    expect(component.projectDialog).toBe(true);
    expect(component.isEditMode).toBe(false);
    expect(component.environments.length).toBe(1);
  });

  it('should navigate to project details on edit', () => {
    const project = {projectId: 'p1', name: 'P1'} as any;
    component.editProject(project);
    fixture.detectChanges();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/projects', 'p1']);
  });

  it('should confirm and delete project', () => {
    const project = {projectId: 'p1', name: 'P1'} as any;
    component.deleteProject(project);
    fixture.detectChanges();

    expect(confirmationServiceMock.confirm).toHaveBeenCalled();

    // Simulate confirm
    const confirmArgs = confirmationServiceMock.confirm.mock.calls[0][0];
    confirmArgs.accept();

    expect(projectsServiceMock.deleteProject).toHaveBeenCalledWith('p1');
    expect(messageServiceMock.add).toHaveBeenCalledWith(expect.objectContaining({summary: 'Successful'}));
  });

  /*describe('saveProject', () => {
    it('should create a new project with environments', async () => {
      component.openNew();
      fixture.detectChanges();

      component.projectForm.patchValue({
        name: 'New Project',
        description: 'Desc'
      });
      component.environments.at(0).patchValue({
        name: 'Prod',
        url: 'http://prod.com'
      });

      const newProject = { projectId: 'new-project', name: 'New Project' };
      projectsServiceMock.createProject.mockReturnValue(of(newProject));
      projectsServiceMock.createEnvironment.mockReturnValue(of({}));

      component.saveProject();

      await new Promise(resolve => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(projectsServiceMock.createProject).toHaveBeenCalled();
      expect(projectsServiceMock.createEnvironment).toHaveBeenCalled();
      expect(component.projectDialog).toBe(false);
    });
  });*/
});
