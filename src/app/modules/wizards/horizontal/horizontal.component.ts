import { Component, OnInit } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ConnectionService } from '../services/connection.service';
import { MainDeal } from './../models/main-deal.model';
@Component({
  selector: 'app-horizontal',
  templateUrl: './horizontal.component.html',
})
export class HorizontalComponent implements OnInit {
  formsCount = 5;
  deal$: BehaviorSubject<MainDeal> =
    new BehaviorSubject<MainDeal>(new MainDeal);
  currentStep$: BehaviorSubject<number> = new BehaviorSubject(1);
  isCurrentFormValid$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private unsubscribe: Subscription[] = [];
  receiver: Subscription;
  data: MainDeal;

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
    debugger
    this.isCurrentFormValid$.next(isFormValid);
  };

  nextStep() {
    if(this.currentStep$.value == 2) {
      if(!this.data.vouchers) {
        this.toast.warning('Please create at least one voucher for your deal!')
        return;
      }
    }
    if(this.currentStep$.value == 3) {
      if(!this.data.termsAndCondition) {
        this.toast.warning('Please fill in the required fields')
        return;
      }
    }
    const nextStep = this.currentStep$.value + 1;
    if (nextStep > this.formsCount) {
      return;
    }
    this.currentStep$.next(nextStep);
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
