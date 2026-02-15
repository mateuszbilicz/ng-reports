import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DevelopersViewComponent } from './developers-view.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DevelopersViewComponent', () => {
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
      // Depending on how headers are used in template, check if they exist.
      // Assuming they are rendered as text or links.
      // Given the file content, headers seem to be used for a TOC or similar.
      // Let's check if the text is present.
      expect(compiled.textContent).toContain(header.name);
    });
  });

  it('should have code snippets', () => {
    expect(component.addingCollectorsCode).toBeTruthy();
    expect(component.addingCollectorsCodeNG_REPORTS_CONFIG).toBeTruthy();
    expect(component.ngLibComponentCode).toBeTruthy();
  });
});
