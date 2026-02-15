import { TestBed } from '@angular/core/testing';
import { RolesService } from './roles-service';
import { AuthService } from '../AuthService/AuthService';
import { Role } from '../../Models/Role';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('RolesService', () => {
  let service: RolesService;
  // let authServiceSpy: any;

  // We need a writable signal to simulate currentUser changes
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
    // Trigger computed update if necessary (Angular signals are lazy)
    // Accessing `service.minRole` should be enough as it calls `this.role()` which is a computed.

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

