import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MainDeal } from './../models/main-deal.model';

@Injectable({
  providedIn: 'root'
})

export class ConnectionService {
  private stepData: BehaviorSubject<MainDeal> = new BehaviorSubject<MainDeal>(new MainDeal);

  sendData(data: any) {
    this.stepData.next(data);
  }

  getData(): Observable<any> {
    return this.stepData.asObservable()
  }
}
