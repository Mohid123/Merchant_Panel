import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileFormDetailsComponent } from './profile-form-details.component';

describe('ProfileFormDetailsComponent', () => {
  let component: ProfileFormDetailsComponent;
  let fixture: ComponentFixture<ProfileFormDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileFormDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileFormDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
