import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  isCurrentFormValid$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private unsubscribe: Subscription[] = [];
  receiver: Subscription;
  data: MainDeal;

  constructor(private toast: HotToastService, public connection: ConnectionService, private cf: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.connection.sendData(new MainDeal);
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
    this.connection.isSaving.next(true);
    // if(this.connection.currentStep$.value == 2) {
    //   if(!this.data.subDeals) {
    //     this.toast.warning('Please create at least one voucher for your deal!');
    //     this.connection.isSaving.next(false);
    //     return;
    //   }
    // }
    if(this.connection.currentStep$.value == 4) {
      // if(this.data.subDeals) {
        debugger
        if(new Date(this.data.subDeals[0]?.voucherStartDate?.year, this.data.subDeals[0]?.voucherStartDate?.month - 1, this.data.subDeals[0]?.voucherStartDate?.day).getTime() > new Date(this.data.subDeals[0]?.voucherEndDate?.year, this.data.subDeals[0]?.voucherEndDate?.month - 1, this.data.subDeals[0]?.voucherEndDate?.day).getTime()) {
          this.toast.warning('Start date cannot exceed End date');
          this.connection.isSaving.next(false);
          return;
        // }
      }
      // if(!(this.data.subDeals[0]?.voucherStartDate && this.data.subDeals[0]?.voucherEndDate) && !this.data.subDeals[0]?.voucherValidity) {
      //   this.toast.warning('Please specify the voucher validity period');
      //   this.connection.isSaving.next(false);
      //   return;
      // }
      else {
        const nextStep = this.connection.currentStep$.value + 1;
        if (nextStep > this.formsCount) {
          return;
        }
        this.connection.currentStep$.next(nextStep);
      }
    }
    else {
      const nextStep = this.connection.currentStep$.value + 1;
      if (nextStep > this.formsCount) {
        return;
      }
      this.connection.currentStep$.next(nextStep);
    }
  }

  prevStep() {
    const prevStep = this.connection.currentStep$.value - 1;
    if (prevStep === 0) {
      return;
    }
    this.connection.currentStep$.next(prevStep);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
