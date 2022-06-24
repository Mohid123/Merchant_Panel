import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MainDeal } from './../models/main-deal.model';

@Injectable({
  providedIn: 'root'
})

export class ConnectionService {
  private stepData: BehaviorSubject<MainDeal> = new BehaviorSubject<MainDeal>(new MainDeal);
  public disabler: boolean = true;
  public isSaving: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  currentStep$: BehaviorSubject<number> = new BehaviorSubject(1);
  sendvideo: BehaviorSubject<any> = new BehaviorSubject('');

  sendData(data: any) {
    this.stepData.next(data);
  }

  sendVideoValue(data: any) {
    this.sendvideo.next(data);
  }

  getVideoValue(): Observable<any> {
    return this.sendvideo.asObservable();
  }

  sendSaveAndNext(data: any) {
    this.saveAndNextData.next(data);
  }

  // sendBoolean(data: any) {
  //   this.disabler.next(data);
  // }

  // getBoolean(): Observable<any> {
  //   return this.disabler.asObservable();
  // }
}
