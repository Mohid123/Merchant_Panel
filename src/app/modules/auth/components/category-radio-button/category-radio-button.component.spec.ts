import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryRadioButtonComponent } from './category-radio-button.component';

describe('CategoryRadioButtonComponent', () => {
  let component: CategoryRadioButtonComponent;
  let fixture: ComponentFixture<CategoryRadioButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoryRadioButtonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryRadioButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
