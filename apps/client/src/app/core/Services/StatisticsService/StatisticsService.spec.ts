// @vitest-environment jsdom
import {TestBed} from '@angular/core/testing';
import {StatisticsService} from './StatisticsService';
import {StatisticsService as ApiStatisticsService} from '../../swagger/api/statistics.service';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';

describe('StatisticsService', () => {
  let service: StatisticsService;
  let apiServiceMock: any;

  beforeEach(() => {
    apiServiceMock = {
      statisticsControllerGetStatistics: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        StatisticsService,
        {provide: ApiStatisticsService, useValue: apiServiceMock}
      ]
    });

    service = TestBed.inject(StatisticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call apiStatisticsService.statisticsControllerGetStatistics with correct params', () => {
    const from = new Date();
    const to = new Date();
    apiServiceMock.statisticsControllerGetStatistics.mockReturnValue(of({}));

    service.getStatistics('day', from, to, 'p1', 'e1', 'filter', 1, true).subscribe();

    expect(apiServiceMock.statisticsControllerGetStatistics).toHaveBeenCalledWith(
      'day', from, to, 'p1', 'e1', 'filter', 1, true
    );
  });
});
