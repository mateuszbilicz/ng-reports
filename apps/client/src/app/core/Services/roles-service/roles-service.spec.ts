import {TestBed} from '@angular/core/testing';

import {RolesService} from './roles-service';
import {AuthService} from '../AuthService/AuthService';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {importProvidersFrom} from '@angular/core';
import {ApiModule, Configuration} from '../../swagger';
import {environment} from '../../../../environments/environment';

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        importProvidersFrom(ApiModule.forRoot(() => new Configuration({basePath: environment.apiUrl}))),
        AuthService,
        RolesService
      ]
    });
    service = TestBed.inject(RolesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
