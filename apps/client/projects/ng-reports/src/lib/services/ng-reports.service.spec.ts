import {TestBed} from '@angular/core/testing';

import {NgReportsService} from './ng-reports.service';

describe('NgReportsService', () => {
  let service: NgReportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgReportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
