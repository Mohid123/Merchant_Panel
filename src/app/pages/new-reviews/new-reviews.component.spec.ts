import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewReviewsComponent } from './new-reviews.component';

describe('NewReviewsComponent', () => {
  let component: NewReviewsComponent;
  let fixture: ComponentFixture<NewReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewReviewsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
