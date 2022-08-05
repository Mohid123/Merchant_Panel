import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MainDeal } from './../models/main-deal.model';

@Injectable({
  providedIn: 'root'
})

export class ConnectionService {
  private stepData: BehaviorSubject<MainDeal> = new BehaviorSubject<MainDeal>(new MainDeal);
  public saveAndNextData: BehaviorSubject<MainDeal> = new BehaviorSubject<MainDeal>(new MainDeal);
  public disabler: boolean = true;
  public isSaving: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isSavingObs = this.isSaving.asObservable();
  currentStep$: BehaviorSubject<number> = new BehaviorSubject(1);

  private stepDataPageOne: BehaviorSubject<MainDeal> = new BehaviorSubject<MainDeal>(new MainDeal);

  canRoute = new BehaviorSubject(false);
  stateURL = new BehaviorSubject('');
  popupState = new BehaviorSubject('');
  public isEditTrue = new BehaviorSubject(false);

  filterOptions = new BehaviorSubject([]);

  // Step 1 data transfer

  sendStep1(data: any) {
    this.stepDataPageOne.next(data);
  }

  getStep1(): Observable<any> {
    return this.stepDataPageOne.asObservable();
  }

  //Normal Steps transfer from form

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

  //FilterOptions data

  sendFilterData(data: any) {
    this.filterOptions.next(data);
  }

  getFilterData(): Observable<any> {
    return this.filterOptions.asObservable();
  }

  // Route Popup

  set getRoutePopup(data: any) {
    this.canRoute.next(data);
  }

  get getRoutePopup(): boolean {
    return this.canRoute.value;
  }

  // State URL Handlers

  set getStateURL(data: any) {
    this.stateURL.next(data);
  }

  get getStateURL(): string {
    return this.stateURL.value;
  }

  // Popup State

  set getSPopupState(data: any) {
    this.popupState.next(data);
  }

  get getSPopupState(): string {
    return this.popupState.value;
  }

  // get and set isSaving

  isSavingNext(): boolean {
    return this.isSaving.value;
  }

  isSavingNextData(data: any) {
    this.isSaving.next(data);
  }

  // Edit mode

  get isEditmode(): boolean {
    return this.isEditTrue.value
  }


  set isEditMode(data: any) {
    this.isEditTrue.next(data);
  }
}
