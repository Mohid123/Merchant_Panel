import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MainDeal } from './../models/main-deal.model';

@Injectable({
  providedIn: 'root'
})

export class ConnectionService {
  private stepData: BehaviorSubject<MainDeal> = new BehaviorSubject<MainDeal>(new MainDeal);
  private disabler: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  sendData(data: any) {
    this.stepData.next(data);
  }

  getData(): Observable<any> {
    return this.stepData.asObservable()
  }

  sendBoolean(data: any) {
    this.disabler.next(data);
  }

  getBoolean(): Observable<any> {
    return this.disabler.asObservable();
  }
}
