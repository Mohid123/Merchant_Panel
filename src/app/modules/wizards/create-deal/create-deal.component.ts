import { Component, OnInit } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MainDeal } from '../models/main-deal.model';
import { ConnectionService } from '../services/connection.service';
@Component({
  selector: 'app-create-deal',
  templateUrl: './create-deal.component.html',
})
export class CreateDealComponent implements OnInit {
  formsCount = 5;
  deal$: BehaviorSubject<MainDeal> =
    new BehaviorSubject<MainDeal>(new MainDeal);
  currentStep$: BehaviorSubject<number> = new BehaviorSubject(1);
  isCurrentFormValid$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private unsubscribe: Subscription[] = [];
  receiver: Subscription;
  booleanReceiver: Subscription
  data: MainDeal;
  booleanData: any;

  constructor(private toast: HotToastService, public connection: ConnectionService) {}

  ngOnInit(): void {
    this.receiver = this.connection.getData().subscribe((res: any) => {
      this.data = res;
    })
  }

  updateDeal = (part: Partial<MainDeal>, isFormValid: boolean) => {
    const currentDeal = this.deal$.value;
    const updatedDeal = { ...currentDeal, ...part };
    this.deal$.next(updatedDeal);
    this.isCurrentFormValid$.next(isFormValid);
  };

  nextStep() {
    if(this.currentStep$.value == 2) {
      if(!this.data.vouchers) {
        this.toast.warning('Please create at least one voucher for your deal!')
        return;
      }
    }
    if(this.currentStep$.value == 4) {
      if(new Date(this.data.vouchers[0]?.voucherStartDate?.year, this.data.vouchers[0]?.voucherStartDate?.month - 1, this.data.vouchers[0]?.voucherStartDate?.day).getTime() > new Date(this.data.vouchers[0]?.voucherEndDate?.year, this.data.vouchers[0]?.voucherEndDate?.month - 1, this.data.vouchers[0]?.voucherEndDate?.day).getTime()) {
        this.toast.warning('Start date cannot exceed End date')
        return;
      }
      if(!(this.data.vouchers[0]?.voucherStartDate && this.data.vouchers[0]?.voucherEndDate) && !this.data.vouchers[0]?.voucherValidity) {
        this.toast.warning('Please specify the voucher validity period')
        return;
      }
      else {
        const nextStep = this.currentStep$.value + 1;
        if (nextStep > this.formsCount) {
          return;
        }
        this.currentStep$.next(nextStep);
      }
    }
    else {
      const nextStep = this.currentStep$.value + 1;
      if (nextStep > this.formsCount) {
        return;
      }
      this.currentStep$.next(nextStep);
    }
  }

  prevStep() {
    if(this.currentStep$.value == 4) {
      this.connection.disabler = false;
    }
    const prevStep = this.currentStep$.value - 1;
    if (prevStep === 0) {
      return;
    }
    this.currentStep$.next(prevStep);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
