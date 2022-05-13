import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class PasswordService {
  private stepData: BehaviorSubject<any> = new BehaviorSubject<any>('');

  sendData(data: any) {
    this.stepData.next(data);
  }

  getData(): Observable<any> {
    return this.stepData.asObservable()
  }
}
