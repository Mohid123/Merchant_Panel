import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlurHashComponent } from './blur-hash.component';

describe('BlurHashComponent', () => {
  let component: BlurHashComponent;
  let fixture: ComponentFixture<BlurHashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlurHashComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlurHashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
