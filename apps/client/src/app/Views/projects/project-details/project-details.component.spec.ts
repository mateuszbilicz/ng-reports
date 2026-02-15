// @vitest-environment jsdom
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ProjectDetailsComponent } from './project-details.component';
import { ProjectsService } from '../../../core/Services/ProjectsService/ProjectsService';
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

describe('ProjectDetailsComponent', () => {
    let component: ProjectDetailsComponent;
    let fixture: ComponentFixture<ProjectDetailsComponent>;
    let projectsServiceMock: any;
    let routerMock: any;
    let messageServiceMock: any;
    let confirmationServiceMock: any;
    let activatedRouteMock: any;

    beforeEach(async () => {
        projectsServiceMock = {
            getProject: vi.fn().mockReturnValue(of({ projectId: 'p1', name: 'Project 1' })),
            getEnvironments: vi.fn().mockReturnValue(of([])),
            updateProject: vi.fn(),
            deleteEnvironment: vi.fn(),
            updateEnvironment: vi.fn(),
            createEnvironment: vi.fn(),
        };

        routerMock = {
            navigate: vi.fn(),
        };

        activatedRouteMock = {
            paramMap: of(convertToParamMap({ id: 'p1' })),
        };

        await TestBed.configureTestingModule({
            imports: [
                ProjectDetailsComponent,
                NoopAnimationsModule,
                ReactiveFormsModule
            ],
            providers: [
                { provide: ProjectsService, useValue: projectsServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: activatedRouteMock },
                MessageService,
                ConfirmationService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProjectDetailsComponent);
        component = fixture.componentInstance;

        messageServiceMock = fixture.debugElement.injector.get(MessageService);
        confirmationServiceMock = fixture.debugElement.injector.get(ConfirmationService);

        vi.spyOn(messageServiceMock, 'add');
        vi.spyOn(confirmationServiceMock, 'confirm');

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load project and environments on init', () => {
        expect(projectsServiceMock.getProject).toHaveBeenCalledWith('p1');
        expect(projectsServiceMock.getEnvironments).toHaveBeenCalledWith('p1');
        expect(component.project()?.name).toBe('Project 1');
    });

    it('should toggle project edit mode', () => {
        component.editProject();
        expect(component.isProjectEditMode()).toBe(true);
        expect(component.projectForm.value.name).toBe('Project 1');

        component.cancelEditProject();
        expect(component.isProjectEditMode()).toBe(false);
    });

    it('should save project updates', () => {
        projectsServiceMock.updateProject.mockReturnValue(of({}));
        component.editProject();
        component.projectForm.patchValue({ name: 'Updated name' });

        component.saveProject();

        expect(projectsServiceMock.updateProject).toHaveBeenCalledWith('p1', expect.objectContaining({ name: 'Updated name' }));
        expect(messageServiceMock.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });

    it('should start new environment editing', () => {
        component.startNewEnv();
        expect(component.editingEnvId()).toBe('new');
        expect(component.envForm.controls.urls.length).toBe(0);
    });
});
