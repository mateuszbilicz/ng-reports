import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatisticsViewComponent } from './statistics-view.component';
import { StatisticsService } from '../../core/Services/StatisticsService/StatisticsService';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Severity } from '../../core/Models/Severity';
import { vi } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { ProjectsService } from '../../core/Services/ProjectsService/ProjectsService';

describe('StatisticsViewComponent', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch { }
    });

    let component: StatisticsViewComponent;
    let fixture: ComponentFixture<StatisticsViewComponent>;
    let statisticsServiceSpy: any;
    let projectsServiceSpy: any;

    const createSpyObj = (methodNames: string[]) => {
        const obj: any = {};
        for (const method of methodNames) {
            obj[method] = vi.fn().mockReturnValue(of({}));
        }
        return obj;
    };

    beforeEach(async () => {
        const statsSpy = createSpyObj(['getStatistics']);
        const projSpy = createSpyObj(['getProjects']);

        projSpy.getProjects.mockReturnValue(of({ items: [] }));
        statsSpy.getStatistics.mockReturnValue(of({ samples: [], totalReports: 0, avgReportsPerSample: 0 }));

        await TestBed.configureTestingModule({
            imports: [StatisticsViewComponent, NoopAnimationsModule],
            providers: [
                { provide: StatisticsService, useValue: statsSpy },
                { provide: ProjectsService, useValue: projSpy }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(StatisticsViewComponent);
        component = fixture.componentInstance;
        statisticsServiceSpy = TestBed.inject(StatisticsService);
        projectsServiceSpy = TestBed.inject(ProjectsService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load statistics', () => {
        const mockStats: any = {
            samples: [
                { label: '2023-01-01', value: 10 },
                { label: '2023-01-02', value: 20 }
            ]
        };
        statisticsServiceSpy.getStatistics.mockReturnValue(of(mockStats));

        component.loadStatistics();

        expect(component.isLoading()).toBe(false);
        expect(statisticsServiceSpy.getStatistics).toHaveBeenCalled();
        expect(component.tableData().length).toBe(2);
        expect(component.chartOptions.series[0].data).toEqual([10, 20]);
        expect(component.chartOptions.xaxis.categories).toEqual(['2023-01-01', '2023-01-02']);
    });

    it('should handle load error', () => {
        statisticsServiceSpy.getStatistics.mockReturnValue(throwError(() => new Error('Error')));

        component.loadStatistics();

        expect(component.isLoading()).toBe(false);
        expect(statisticsServiceSpy.getStatistics).toHaveBeenCalled();
        expect(component.tableData().length).toBe(0);
    });

    it('should update chart colors based on severity', () => {
        component.filterForm.patchValue({ severity: Severity.Critical });
        component.updateChartOptionsDependingOnSeverity();
        expect(component.chartOptions.chart.fill.gradient.gradientToColors[0]).toBe('#ff0000');
    });

    it('should export to CSV', () => {
        component.tableData.set([{ date: '2023-01-01', value: 10 } as any]);
        expect(() => component.exportToCSV()).not.toThrow();
    });
});
