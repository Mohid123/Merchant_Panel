import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MainDeal } from './../models/main-deal.model';

@Injectable({
  providedIn: 'root'
})

export class ConnectionService {
  private stepData: BehaviorSubject<MainDeal> = new BehaviorSubject<MainDeal>({});

  sendData(data: MainDeal) {
    this.stepData.next(data);
  }

  getData(): Observable<MainDeal> {
    return this.stepData.asObservable()
  }
}
