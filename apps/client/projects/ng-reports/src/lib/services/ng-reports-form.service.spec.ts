import {TestBed} from '@angular/core/testing';

import {NgReportsFormService} from './ng-reports-form.service';

describe('NgReportsFormService', () => {
  let service: NgReportsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgReportsFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
