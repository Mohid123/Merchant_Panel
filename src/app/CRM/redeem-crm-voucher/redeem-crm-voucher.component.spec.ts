import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemCrmVoucherComponent } from './redeem-crm-voucher.component';

describe('RedeemCrmVoucherComponent', () => {
  let component: RedeemCrmVoucherComponent;
  let fixture: ComponentFixture<RedeemCrmVoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RedeemCrmVoucherComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RedeemCrmVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
