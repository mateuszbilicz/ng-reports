// @vitest-environment jsdom
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReportsViewComponent } from './reports-view.component';
import { ReportsService } from '../../core/Services/ReportsService/ReportsService';
import { ProjectsService } from '../../core/Services/ProjectsService/ProjectsService';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

describe('ReportsViewComponent', () => {
    let component: ReportsViewComponent;
    let fixture: ComponentFixture<ReportsViewComponent>;
    let reportsServiceMock: any;
    let projectsServiceMock: any;
    let routerMock: any;
    let messageServiceMock: any;
    let confirmationServiceMock: any;
    let activatedRouteMock: any;

    beforeEach(async () => {
        reportsServiceMock = {
            getReports: vi.fn().mockReturnValue(of([])),
            deleteReport: vi.fn().mockReturnValue(of({})),
            createReport: vi.fn(),
            updateReport: vi.fn(),
        };

        projectsServiceMock = {
            getProjects: vi.fn().mockReturnValue(of({ items: [] })),
            getEnvironments: vi.fn().mockReturnValue(of({ items: [] })),
        };

        routerMock = {
            navigate: vi.fn(),
        };

        activatedRouteMock = {
            queryParams: of({}),
        };

        await TestBed.configureTestingModule({
            imports: [
                ReportsViewComponent,
                NoopAnimationsModule,
                ReactiveFormsModule
            ],
            providers: [
                { provide: ReportsService, useValue: reportsServiceMock },
                { provide: ProjectsService, useValue: projectsServiceMock },
                { provide: Router, useValue: routerMock },
                { provide: ActivatedRoute, useValue: activatedRouteMock },
                MessageService,
                ConfirmationService
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ReportsViewComponent);
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

    it('should load tree nodes on init', () => {
        const projects = [{ projectId: 'p1', name: 'Project 1' }];
        const envs = [{ environmentId: 'e1', name: 'Env 1' }];
        projectsServiceMock.getProjects.mockReturnValue(of({ items: projects }));
        projectsServiceMock.getEnvironments.mockReturnValue(of({ items: envs }));

        component.ngOnInit();
        fixture.detectChanges();

        expect(projectsServiceMock.getProjects).toHaveBeenCalled();
        expect(component.nodes().length).toBe(1);
        expect(component.nodes()[0].children?.length).toBe(1);
    });

    it('should load reports when a node is selected', () => {
        const event = { node: { data: { envId: 'e1' } } };
        component.onNodeSelect(event);

        expect(reportsServiceMock.getReports).toHaveBeenCalledWith('e1');
        expect(routerMock.navigate).toHaveBeenCalled();
    });

    it('should delete report after confirmation', () => {
        const report = { id: 'r1', title: 'R1' } as any;
        component.currentEnvIdForList = 'e1';
        component.deleteReport(report);

        expect(confirmationServiceMock.confirm).toHaveBeenCalled();
        const confirmArgs = confirmationServiceMock.confirm.mock.calls[0][0];
        confirmArgs.accept();

        expect(reportsServiceMock.deleteReport).toHaveBeenCalledWith('r1');
        expect(messageServiceMock.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });
});
