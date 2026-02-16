// @vitest-environment jsdom
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DevelopersViewComponent} from './developers-view.component';
import {beforeEach, describe, expect, it} from 'vitest';

describe('DevelopersViewComponent', () => {
  let component: DevelopersViewComponent;
  let fixture: ComponentFixture<DevelopersViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevelopersViewComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DevelopersViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have headers for the documentation', () => {
    expect(component.headers.length).toBeGreaterThan(0);
    expect(component.headers[0].name).toBe('How to use NG Reports');
  });

  it('should contain collector configuration code snippets', () => {
    expect(component.addingCollectorsCode).toContain('NgReportsService');
    expect(component.addingCollectorsCodeNG_REPORTS_CONFIG).toContain('collectConsoleLogs');
  });
});
