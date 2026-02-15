import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevelopersViewComponent } from './developers-view.component';

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
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
