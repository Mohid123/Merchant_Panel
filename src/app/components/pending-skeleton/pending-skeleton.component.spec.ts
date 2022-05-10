import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingSkeletonComponent } from './pending-skeleton.component';

describe('PendingSkeletonComponent', () => {
  let component: PendingSkeletonComponent;
  let fixture: ComponentFixture<PendingSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingSkeletonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
