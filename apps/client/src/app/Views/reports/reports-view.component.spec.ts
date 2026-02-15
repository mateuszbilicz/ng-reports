import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsViewComponent } from './reports-view.component';
import { ProjectsService } from '../../core/Services/ProjectsService/ProjectsService';
import { ReportsService } from '../../core/Services/ReportsService/ReportsService';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Report } from '../../core/swagger/model/report';
import { Severity } from '../../core/Models/Severity';
import { vi } from 'vitest';

describe('ReportsViewComponent', () => {
    let component: ReportsViewComponent;
    let fixture: ComponentFixture<ReportsViewComponent>;
    let projectsServiceSpy: any;
    let reportsServiceSpy: any;
    let routerSpy: any;
    let messageServiceSpy: any;
    let confirmationServiceSpy: any;

    beforeEach(async () => {
        const projSpy = {
            getProjects: vi.fn(),
            getEnvironments: vi.fn()
        };
        const repSpy = {
            getReports: vi.fn(),
            deleteReport: vi.fn(),
            createReport: vi.fn(),
            updateReport: vi.fn()
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
            imports: [ReportsViewComponent, NoopAnimationsModule],
            providers: [
                { provide: ProjectsService, useValue: projSpy },
                { provide: ReportsService, useValue: repSpy },
                { provide: Router, useValue: routerSpyObj },
                { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
            ]
        })
            .overrideComponent(ReportsViewComponent, {
                set: {
                    providers: [
                        { provide: MessageService, useValue: messageSpy },
                        { provide: ConfirmationService, useValue: confirmSpy }
                    ]
                }
            })
            .compileComponents();

        fixture = TestBed.createComponent(ReportsViewComponent);
        component = fixture.componentInstance;
        projectsServiceSpy = TestBed.inject(ProjectsService);
        reportsServiceSpy = TestBed.inject(ReportsService);
        routerSpy = TestBed.inject(Router);
        messageServiceSpy = messageSpy;
        confirmationServiceSpy = confirmSpy;

        projectsServiceSpy.getProjects.mockReturnValue(of([{ projectId: 'p1', name: 'Project 1' }]));
        projectsServiceSpy.getEnvironments.mockReturnValue(of({ environments: [{ environmentId: 'e1', name: 'Env 1' }] }));
        reportsServiceSpy.getReports.mockReturnValue(of([]));
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load tree nodes on init', () => {
        fixture.detectChanges();
        expect(projectsServiceSpy.getProjects).toHaveBeenCalled();
        // Verify nodes structure
        const nodes = component.nodes();
        expect(nodes.length).toBe(1);
        expect(nodes[0].label).toBe('Project 1');
        expect(nodes[0].children?.length).toBe(1);
        expect(nodes[0].children?.[0].key).toBe('e1');
    });

    it('should load reports when environment selected', () => {
        fixture.detectChanges();
        const node = { data: { envId: 'e1' } };
        component.onNodeSelect(node);

        expect(reportsServiceSpy.getReports).toHaveBeenCalledWith('e1');
        expect(routerSpy.navigate).toHaveBeenCalledWith([], expect.objectContaining({ queryParams: { envId: 'e1' } }));
    });

    it('should open new report dialog', () => {
        fixture.detectChanges();
        component.openNew();
        expect(component.reportDialog).toBe(true);
        expect(component.isEditMode).toBe(false);
    });

    it('should edit report (navigate)', () => {
        fixture.detectChanges();
        const report = { id: 'r1' } as any;
        component.editReport(report);
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/reports', 'r1']);
    });

    it('should delete report', () => {
        fixture.detectChanges();
        const report = { id: 'r1', title: 'R1' } as any;
        confirmationServiceSpy.confirm.mockImplementation((config: any) => config.accept());
        reportsServiceSpy.deleteReport.mockReturnValue(of(report));

        component.deleteReport(report);

        expect(reportsServiceSpy.deleteReport).toHaveBeenCalledWith('r1');
        expect(messageServiceSpy.add).toHaveBeenCalledWith(expect.objectContaining({ severity: 'success' }));
    });
});

