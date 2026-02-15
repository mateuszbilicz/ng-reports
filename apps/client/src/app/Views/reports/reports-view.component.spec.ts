import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsViewComponent } from './reports-view.component';
import { ProjectsService } from '../../core/Services/ProjectsService/ProjectsService';
import { ReportsService } from '../../core/Services/ReportsService/ReportsService';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { MessageService, ConfirmationService, TreeNode } from 'primeng/api';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Report } from '../../core/swagger/model/report';
import { Severity } from '../../core/Models/Severity';
import { vi } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('ReportsViewComponent', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch { }
    });

    let component: ReportsViewComponent;
    let fixture: ComponentFixture<ReportsViewComponent>;
    let projectsServiceSpy: any;
    let reportsServiceSpy: any;
    let routerSpy: any;
    let messageServiceSpy: any;
    let confirmationServiceSpy: any;

    const createSpyObj = (methodNames: string[]) => {
        const obj: any = {};
        for (const method of methodNames) {
            obj[method] = vi.fn().mockReturnValue(of({}));
        }
        return obj;
    };

    beforeEach(async () => {
        const projSpy = createSpyObj(['getProjects', 'getEnvironments']);
        const repSpy = createSpyObj(['getReports', 'deleteReport', 'createReport', 'updateReport']);
        const routerSpyObj = createSpyObj(['navigate']);

        const messageSpy = {
            add: vi.fn(),
            addAll: vi.fn(),
            clear: vi.fn(),
            messageObserver: of(null),
            clearObserver: of(null)
        };
        const confirmSpy = {
            confirm: vi.fn(),
            close: vi.fn(),
            requireConfirmation$: of(null),
            acceptConfirmation$: of(null)
        };

        const routeMock = {
            queryParams: of({ envId: 'e1' }),
            paramMap: of(convertToParamMap({})),
            snapshot: {
                queryParams: { envId: 'e1' },
                paramMap: convertToParamMap({})
            }
        };

        await TestBed.configureTestingModule({
            imports: [ReportsViewComponent, NoopAnimationsModule],
            providers: [
                { provide: ProjectsService, useValue: projSpy },
                { provide: ReportsService, useValue: repSpy },
                { provide: Router, useValue: routerSpyObj },
                { provide: MessageService, useValue: messageSpy },
                { provide: ConfirmationService, useValue: confirmSpy },
                { provide: ActivatedRoute, useValue: routeMock }
            ]
        })
            .overrideComponent(ReportsViewComponent, {
                set: {
                    providers: [
                        { provide: MessageService, useValue: messageSpy },
                        { provide: ConfirmationService, useValue: confirmSpy },
                        { provide: ProjectsService, useValue: projSpy },
                        { provide: ReportsService, useValue: repSpy },
                        { provide: Router, useValue: routerSpyObj },
                        { provide: ActivatedRoute, useValue: routeMock }
                    ]
                }
            })
            .compileComponents();

        projectsServiceSpy = projSpy;
        reportsServiceSpy = repSpy;
        routerSpy = routerSpyObj;
        messageServiceSpy = messageSpy;
        confirmationServiceSpy = confirmSpy;

        // Mock initial load
        projectsServiceSpy.getProjects.mockReturnValue(of({ items: [{ projectId: 'p1', name: 'Project 1' }] }));
        projectsServiceSpy.getEnvironments.mockReturnValue(of({ environments: [{ environmentId: 'e1', name: 'Env 1' }] }));
        reportsServiceSpy.getReports.mockReturnValue(of([]));

        fixture = TestBed.createComponent(ReportsViewComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should load tree nodes on init', () => {
        fixture.detectChanges();
        expect(projectsServiceSpy.getProjects).toHaveBeenCalled();
        const nodes = component.nodes();
        expect(nodes.length).toBe(1);
    });

    it('should load reports when environment selected', () => {
        fixture.detectChanges();
        const node = { data: { envId: 'e1' } };
        component.onNodeSelect(node);
        expect(reportsServiceSpy.getReports).toHaveBeenCalledWith('e1');
    });

    it('should open new report dialog', () => {
        fixture.detectChanges();
        component.openNew();
        expect(component.reportDialog).toBe(true);
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
    });
});
