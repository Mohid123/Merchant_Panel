import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MainDeal } from './../models/main-deal.model';

@Injectable({
  providedIn: 'root'
})

export class ConnectionService {
  private stepData: BehaviorSubject<MainDeal> = new BehaviorSubject<MainDeal>(new MainDeal);
  private saveAndNextData: BehaviorSubject<MainDeal> = new BehaviorSubject<MainDeal>(new MainDeal);
  public disabler: boolean = true;
  public isSaving: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  currentStep$: BehaviorSubject<number> = new BehaviorSubject(1);

  editDealSubject: BehaviorSubject<any> = new BehaviorSubject({});

  canRoute = new BehaviorSubject(false);

  filterOptions = new BehaviorSubject([]);

  sendData(data: any) {
    this.stepData.next(data);
  }

  sendSaveAndNext(data: any) {
    this.saveAndNextData.next(data);
  }

  getSaveAndNext(): Observable<any> {
    return this.saveAndNextData.asObservable();
  }

  getData(): Observable<any> {
    return this.stepData.asObservable();
  }

  // EDIt DEAL DATA.

  sendEditDealData(data: any) {
    this.editDealSubject.next(data);
  }

  getEditDealData(): Observable<any> {
    return this.editDealSubject.asObservable();
  }

  //FilterOptions data

  sendFilterData(data: any) {
    this.filterOptions.next(data);
  }

  getFilterData(): Observable<any> {
    return this.filterOptions.asObservable();
  }

  //route Popup

  sendRoutePopup(data: any) {
    debugger
    this.canRoute.next(data);
  }

  getRoutePopup(): Observable<any> {
    debugger
    return this.canRoute.asObservable();
  }
}
