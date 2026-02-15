// @vitest-environment jsdom
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { StatisticsViewComponent } from './statistics-view.component';
import { StatisticsService } from '../../core/Services/StatisticsService/StatisticsService';
import { ProjectsService } from '../../core/Services/ProjectsService/ProjectsService';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { signal } from '@angular/core';

// Mock ApexCharts
vi.mock('ng-apexcharts', () => ({
    ChartComponent: {
        template: '<div></div>',
        providers: [],
        standalone: true,
        selector: 'apx-chart'
    }
}));

describe('StatisticsViewComponent', () => {
    let component: StatisticsViewComponent;
    let fixture: ComponentFixture<StatisticsViewComponent>;
    let statisticsServiceMock: any;
    let projectsServiceMock: any;

    beforeEach(async () => {
        statisticsServiceMock = {
            getStatistics: vi.fn().mockReturnValue(of({ samples: [] })),
        };

        projectsServiceMock = {
            getProjects: vi.fn().mockReturnValue(of({ items: [] })),
        };

        await TestBed.configureTestingModule({
            imports: [
                StatisticsViewComponent,
                NoopAnimationsModule,
                ReactiveFormsModule,
            ],
            providers: [
                { provide: StatisticsService, useValue: statisticsServiceMock },
                { provide: ProjectsService, useValue: projectsServiceMock },
            ]
        }).compileComponents();
    });

    function createComponent() {
        fixture = TestBed.createComponent(StatisticsViewComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    it('should create', () => {
        createComponent();
        expect(component).toBeTruthy();
    });

    it('should initialize with default filters', () => {
        createComponent();
        expect(component.filterForm.get('sampling')?.value).toBe('day');
        expect(component.viewControl.value).toBe('chart');
    });

    it('should load statistics on calling loadStatistics', () => {
        createComponent();
        const statsData = {
            samples: [
                { label: '2024-01-01', value: 10 },
                { label: '2024-01-02', value: 20 }
            ]
        };
        statisticsServiceMock.getStatistics.mockReturnValue(of(statsData));

        component.loadStatistics();

        expect(statisticsServiceMock.getStatistics).toHaveBeenCalled();
        expect(component.tableData().length).toBe(2);
        expect(component.chartOptions.series[0].data).toEqual([10, 20]);
    });

    it('should update environments when project changes', () => {
        const projects = [
            { projectId: 'p1', environments: [{ name: 'dev' }, { name: 'prod' }] }
        ];
        projectsServiceMock.getProjects.mockReturnValue(of({ items: projects }));

        createComponent();

        component.filterForm.get('projectId')?.setValue('p1');

        expect(component.environments().length).toBe(2);
        expect(component.environments()[0].name).toBe('dev');
    });
});
