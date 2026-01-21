import {TestBed} from '@angular/core/testing';

import {NgReportsConsoleService} from './ng-reports-console.service';

describe('NgReportsConsoleService', () => {
  let service: NgReportsConsoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgReportsConsoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
