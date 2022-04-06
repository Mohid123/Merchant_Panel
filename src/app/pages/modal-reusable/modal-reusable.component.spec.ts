import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalReusableComponent } from './modal-reusable.component';

describe('ModalReusableComponent', () => {
  let component: ModalReusableComponent;
  let fixture: ComponentFixture<ModalReusableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalReusableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalReusableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
