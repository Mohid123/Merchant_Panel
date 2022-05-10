import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@core/models/user.model';
import { ApiService } from '@core/services/api.service';
import { BusinessHours } from './../models/business-hours.modal';

type AuthApiData = User | any;

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService<AuthApiData> {

  constructor(
    protected override http: HttpClient,
  ) {
    super(http)
  }

  getUser(userId:string) {
    return this.get('/users/getUserById/'+ userId)
  }

  updateBusinessHours(params : {id: string , businessHours: BusinessHours[]}){
    return this.post('/users/updateBusinessHours',params)
  }

  updateIBAN(iban:string) {
    return this.post('/users/completeKYC',{iban})
  }
}
