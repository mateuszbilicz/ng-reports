import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectDetailsComponent } from './project-details.component';
import { ProjectsService } from '../../../core/Services/ProjectsService/ProjectsService';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Project } from '../../../core/swagger/model/project';
import { Environment } from '../../../core/swagger/model/environment';
import { vi } from 'vitest';

describe('ProjectDetailsComponent', () => {
    let component: ProjectDetailsComponent;
    let fixture: ComponentFixture<ProjectDetailsComponent>;
    let projectsServiceSpy: any;
    let routerSpy: any;
    let messageServiceSpy: any;
    let confirmationServiceSpy: any;

    beforeEach(async () => {
        const projSpy = {
            getProject: vi.fn(),
            getEnvironments: vi.fn(),
            updateProject: vi.fn(),
            createEnvironment: vi.fn(),
            updateEnvironment: vi.fn(),
            deleteEnvironment: vi.fn()
        };
        const routerSpyObj = {
            navigate: vi.fn()
        };
        const messageSpy = {
            add: vi.fn()
        };
        const confirmSpy = {
            confirm: vi.fn()
        };

        await TestBed.configureTestingModule({
            imports: [ProjectDetailsComponent, NoopAnimationsModule],
            providers: [
                { provide: ProjectsService, useValue: projSpy },
                { provide: Router, useValue: routerSpyObj },
                { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => 'p1' }) } }
            ]
        })
            .overrideComponent(ProjectDetailsComponent, {
                set: {
                    providers: [
                        { provide: MessageService, useValue: messageSpy },
                        { provide: ConfirmationService, useValue: confirmSpy }
                    ]
                }
            })
            .compileComponents();

        fixture = TestBed.createComponent(ProjectDetailsComponent);
        component = fixture.componentInstance;
        projectsServiceSpy = TestBed.inject(ProjectsService);
        routerSpy = TestBed.inject(Router);
        messageServiceSpy = messageSpy;
        confirmationServiceSpy = confirmSpy;

        projectsServiceSpy.getProject.mockReturnValue(of({ id: '1', projectId: 'p1', name: 'Project 1' } as Project));
        projectsServiceSpy.getEnvironments.mockReturnValue(of({ environments: [{ id: 'e1', environmentId: 'e1', name: 'Env 1' }] }));
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load data on init', () => {
        fixture.detectChanges();
        expect(projectsServiceSpy.getProject).toHaveBeenCalledWith('p1');
        expect(projectsServiceSpy.getEnvironments).toHaveBeenCalledWith('p1');
        expect(component.project()).toBeTruthy();
        expect(component.environments().length).toBe(1);
    });

    it('should enable project edit mode', () => {
        fixture.detectChanges();
        component.editProject();
        expect(component.isProjectEditMode()).toBe(true);
        expect(component.projectForm.value.name).toBe('Project 1');
    });

    it('should save project updates', () => {
        fixture.detectChanges();
        component.editProject();
        component.projectForm.patchValue({ name: 'Updated' });

        projectsServiceSpy.updateProject.mockReturnValue(of({ id: '1', projectId: 'p1', name: 'Updated' } as Project));

        component.saveProject();

        expect(projectsServiceSpy.updateProject).toHaveBeenCalled();
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
        expect(component.isProjectEditMode()).toBe(false);
    });

    it('should delete environment', () => {
        fixture.detectChanges();
        const env: Environment = { id: 'e1', environmentId: 'e1', name: 'Env 1' };

        confirmationServiceSpy.confirm.mockImplementation((config: any) => config.accept());
        projectsServiceSpy.deleteEnvironment.mockReturnValue(of(env));

        component.deleteEnv(env);

        expect(projectsServiceSpy.deleteEnvironment).toHaveBeenCalledWith('e1');
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });
});

