import { TestBed } from '@angular/core/testing';
import { StatisticsService } from './StatisticsService';
import { StatisticsService as ApiStatisticsService } from '../../swagger/api/statistics.service';
import { of } from 'rxjs';
import { Statistics } from '../../swagger';

describe('StatisticsService', () => {
    let service: StatisticsService;
    let apiStatisticsServiceSpy: jasmine.SpyObj<ApiStatisticsService>;

    beforeEach(() => {
        const spy = jasmine.createSpyObj('ApiStatisticsService', ['statisticsControllerGetStatistics']);
        TestBed.configureTestingModule({
            providers: [
                StatisticsService,
                { provide: ApiStatisticsService, useValue: spy }
            ]
        });
        service = TestBed.inject(StatisticsService);
        apiStatisticsServiceSpy = TestBed.inject(ApiStatisticsService) as jasmine.SpyObj<ApiStatisticsService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get statistics', (done) => {
        const mockStats: Statistics = {
            totalReports: 10,
            reportsByDate: [],
            reportsBySeverity: [],
            reportsByStatus: []
        };
        apiStatisticsServiceSpy.statisticsControllerGetStatistics.and.returnValue(of(mockStats));

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
    });
});
