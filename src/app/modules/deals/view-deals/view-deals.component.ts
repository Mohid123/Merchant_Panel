import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-view-deals',
  templateUrl: './view-deals.component.html',
  styleUrls: ['./view-deals.component.scss'],
})
export class ViewDealsComponent implements OnInit {
  formsCount = 5;

  currentStep$: BehaviorSubject<number> = new BehaviorSubject(1);
  isCurrentFormValid$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false,
  );
  private unsubscribe: Subscription[] = [];

  constructor() {}

  ngOnInit(): void {}

  changeStep(nextStep: number) {
    this.currentStep$.next(nextStep);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
