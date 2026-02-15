import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DevelopersViewComponent } from './developers-view.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

describe('DevelopersViewComponent', () => {
  beforeAll(() => {
    try {
      getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
    } catch { }
  });

  let component: DevelopersViewComponent;
  let fixture: ComponentFixture<DevelopersViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevelopersViewComponent, NoopAnimationsModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DevelopersViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render headers', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    component.headers.forEach(header => {
      expect(compiled.textContent).toContain(header.name);
    });
  });

  it('should have code snippets', () => {
    expect(component.addingCollectorsCode).toBeTruthy();
    expect(component.addingCollectorsCodeNG_REPORTS_CONFIG).toBeTruthy();
    expect(component.ngLibComponentCode).toBeTruthy();
  });
});
