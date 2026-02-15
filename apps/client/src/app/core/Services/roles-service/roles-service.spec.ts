import { vi } from 'vitest';
import {getTestBed, TestBed} from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import {signal} from '@angular/core';
import {RolesService} from './roles-service';
import {AuthService} from '../AuthService/AuthService';
import {Role} from '../../Models/Role';

describe('RolesService', () => {
  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch { }
  });

  let service: RolesService;

  const currentUserSignal = signal<any>(null);

  beforeEach(() => {
    const authSpy = {
      currentUser: currentUserSignal
    };

    TestBed.configureTestingModule({
      providers: [
        RolesService,
        { provide: AuthService, useValue: authSpy }
      ]
    });
    service = TestBed.inject(RolesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should correctly determine minimal role', () => {
    currentUserSignal.set({ role: Role.Admin });

    expect(service.minRole(Role.Developer)).toBe(true);
    expect(service.minRole(Role.Admin)).toBe(true);

    currentUserSignal.set({ role: Role.Developer });
    expect(service.minRole(Role.Developer)).toBe(true);
    expect(service.minRole(Role.Admin)).toBe(false);
  });

  it('should identify admin', () => {
    currentUserSignal.set({ role: Role.Admin });
    expect(service.isAdmin()).toBe(true);

    currentUserSignal.set({ role: Role.Developer });
    expect(service.isAdmin()).toBe(false);
  });

  it('should handle missing role (default to 0)', () => {
    currentUserSignal.set({}); // No role
    expect(service.minRole(Role.Developer)).toBe(false); // Developer is 1

    currentUserSignal.set(null); // No user
    expect(service.minRole(Role.Developer)).toBe(false);
  });
});

