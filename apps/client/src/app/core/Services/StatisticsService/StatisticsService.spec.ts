import { TestBed } from '@angular/core/testing';
import { StatisticsService } from './StatisticsService';
import { StatisticsService as ApiStatisticsService } from '../../swagger/api/statistics.service';
import { of } from 'rxjs';
import { Statistics } from '../../swagger';
import { vi } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('StatisticsService', () => {
    beforeAll(() => {
        try {
            getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
        } catch { }
    });

    let service: StatisticsService;
    let apiStatisticsServiceSpy: any;

    const createSpyObj = (methodNames: string[]) => {
        const obj: any = {};
        for (const method of methodNames) {
            obj[method] = vi.fn();
        }
        return obj;
    };

    beforeEach(() => {
        const spy = createSpyObj(['statisticsControllerGetStatistics']);
        apiStatisticsServiceSpy = spy;

        TestBed.configureTestingModule({
            providers: [
                StatisticsService,
                { provide: ApiStatisticsService, useValue: apiStatisticsServiceSpy }
            ]
        });
        service = TestBed.inject(StatisticsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get statistics', () => new Promise<void>((done) => {
        const mockStats: Statistics = {
            totalReports: 10,
            sampling: 'daily',
            samples: [],
            avgReportsPerSample: 2
        };
        apiStatisticsServiceSpy.statisticsControllerGetStatistics.mockReturnValue(of(mockStats));

        const dateFrom = new Date();
        const dateTo = new Date();

        service.getStatistics('daily', dateFrom, dateTo, 'proj1', 'env1', 'filter', 1, true).subscribe(stats => {
            expect(stats).toEqual(mockStats);
            expect(apiStatisticsServiceSpy.statisticsControllerGetStatistics).toHaveBeenCalledWith(
                'daily',
                dateFrom,
                dateTo,
                'proj1',
                'env1',
                'filter',
                1,
                true
            );
            done();
        });
    }));
});
