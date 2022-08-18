import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DealCRMComponent } from './deal-crm.component';

describe('DealCRMComponent', () => {
  let component: DealCRMComponent;
  let fixture: ComponentFixture<DealCRMComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DealCRMComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DealCRMComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
