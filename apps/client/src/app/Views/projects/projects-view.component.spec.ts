import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsViewComponent } from './projects-view.component';
import { ProjectsService } from '../../core/Services/ProjectsService/ProjectsService';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Project } from '../../core/swagger/model/project';
import { vi } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('ProjectsViewComponent', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch { }
    });

    let component: ProjectsViewComponent;
    let fixture: ComponentFixture<ProjectsViewComponent>;
    let projectsServiceSpy: any;
    let routerSpy: any;
    let messageServiceSpy: any;
    let confirmationServiceSpy: any;

    beforeEach(async () => {
        const projSpy = {
            getProjects: vi.fn(),
            createProject: vi.fn(),
            updateProject: vi.fn(),
            deleteProject: vi.fn(),
            createEnvironment: vi.fn()
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
            imports: [ProjectsViewComponent, NoopAnimationsModule],
            providers: [
                { provide: ProjectsService, useValue: projSpy },
                { provide: Router, useValue: routerSpyObj },
            ]
        })
            .overrideComponent(ProjectsViewComponent, {
                set: {
                    providers: [
                        { provide: MessageService, useValue: messageSpy },
                        { provide: ConfirmationService, useValue: confirmSpy }
                    ]
                }
            })
            .compileComponents();

        fixture = TestBed.createComponent(ProjectsViewComponent);
        component = fixture.componentInstance;
        projectsServiceSpy = TestBed.inject(ProjectsService);
        routerSpy = TestBed.inject(Router);
        messageServiceSpy = messageSpy;
        confirmationServiceSpy = confirmSpy;

        projectsServiceSpy.getProjects.mockReturnValue(of([{ id: '1', name: 'p1' }]));
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load projects on init', () => {
        fixture.detectChanges();
        expect(projectsServiceSpy.getProjects).toHaveBeenCalled();
        expect(component.projects().length).toBe(1);
    });

    it('should add environment', () => {
        fixture.detectChanges();
        expect(component.environments.length).toBe(0);
        component.addEnvironment();
        expect(component.environments.length).toBe(1);
    });

    it('should remove environment', () => {
        fixture.detectChanges();
        component.addEnvironment();
        component.removeEnvironment(0);
        expect(component.environments.length).toBe(0);
    });

    it('should open new project dialog', () => {
        fixture.detectChanges();
        component.openNew();
        expect(component.projectDialog).toBe(true);
        expect(component.isEditMode).toBe(false);
        // openNew calls addEnvironment, so length should be 1
        expect(component.environments.length).toBe(1);
    });

    it('should navigate to edit project', () => {
        const project: Project = { id: '1', name: 'p1', projectId: 'p1' } as any;
        component.editProject(project);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/projects', 'p1']);
    });

    it('should delete project', () => {
        const project: Project = { id: '1', name: 'p1', projectId: 'p1' } as any;
        confirmationServiceSpy.confirm.mockImplementation((config: any) => {
            config.accept();
        });
        projectsServiceSpy.deleteProject.mockReturnValue(of(project));

        component.deleteProject(project);

        expect(projectsServiceSpy.deleteProject).toHaveBeenCalledWith('p1');
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });
});

