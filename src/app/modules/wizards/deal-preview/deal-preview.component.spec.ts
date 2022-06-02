import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealPreviewComponent } from './deal-preview.component';

describe('DealPreviewComponent', () => {
  let component: DealPreviewComponent;
  let fixture: ComponentFixture<DealPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DealPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DealPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
