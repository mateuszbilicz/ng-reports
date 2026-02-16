// @vitest-environment jsdom
import {TestBed} from '@angular/core/testing';
import {ReportsService} from './ReportsService';
import {ReportsService as ApiReportsService} from '../../swagger/api/reports.service';
import {of} from 'rxjs';
import {beforeEach, describe, expect, it, vi} from 'vitest';

describe('ReportsService', () => {
  let service: ReportsService;
  let apiServiceMock: any;

  beforeEach(() => {
    apiServiceMock = {
      reportsControllerFindAll: vi.fn(),
      reportsControllerFindOne: vi.fn(),
      reportsControllerCreateForm: vi.fn(),
      reportsControllerUpdate: vi.fn(),
      reportsControllerRemove: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ReportsService,
        {provide: ApiReportsService, useValue: apiServiceMock}
      ]
    });

    service = TestBed.inject(ReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call reportsControllerFindAll on getReports', () => {
    apiServiceMock.reportsControllerFindAll.mockReturnValue(of({}));
    service.getReports('env1', 'filter', 10, 0).subscribe();
    expect(apiServiceMock.reportsControllerFindAll).toHaveBeenCalledWith('env1', 'filter', 10, 0);
  });

  it('should call reportsControllerCreateForm with defaults when creating', () => {
    apiServiceMock.reportsControllerCreateForm.mockReturnValue(of({}));
    service.createReport('env1', {title: 'Test'}).subscribe();

    expect(apiServiceMock.reportsControllerCreateForm).toHaveBeenCalled();
    const args = apiServiceMock.reportsControllerCreateForm.mock.calls[0];
    expect(args[2]).toBe('Test'); // Title
    expect(args[13]).toBe('env1'); // EnvironmentId
  });
});
