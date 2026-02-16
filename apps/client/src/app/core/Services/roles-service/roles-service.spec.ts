// @vitest-environment jsdom
import {TestBed} from '@angular/core/testing';
import {RolesService} from './roles-service';
import {AuthService} from '../AuthService/AuthService';
import {signal} from '@angular/core';
import {Role} from '../../Models/Role';
import {beforeEach, describe, expect, it} from 'vitest';

describe('RolesService', () => {
  let service: RolesService;
  let authServiceMock: any;
  let currentUserSignal = signal<any>(null);

  beforeEach(() => {
    authServiceMock = {
      currentUser: currentUserSignal
    };

    TestBed.configureTestingModule({
      providers: [
        RolesService,
        {provide: AuthService, useValue: authServiceMock}
      ]
    });

    service = TestBed.inject(RolesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return correct role level', () => {
    currentUserSignal.set({role: Role.Admin.toString()});
    expect(service.minRole(Role.Admin)).toBe(true);
    expect(service.minRole(Role.ProjectManager)).toBe(true);
    expect(service.isAdmin()).toBe(true);

    currentUserSignal.set({role: Role.Analyst.toString()});
    expect(service.minRole(Role.Admin)).toBe(false);
    expect(service.isAdmin()).toBe(false);
    expect(service.isAnalyst()).toBe(true);
  });

  it('should handle missing role by defaulting to 0 (Analyst)', () => {
    currentUserSignal.set({});
    expect(service.isAnalyst()).toBe(true);
    expect(service.minRole(Role.Developer)).toBe(false);
  });
});
