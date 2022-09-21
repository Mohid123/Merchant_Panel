import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { User } from '@core/models/user.model';
import { ApiService } from '@core/services/api.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { BusinessHours } from './../models/business-hours.modal';

type AuthApiData = User | any;

@Injectable({
  providedIn: 'root'
})
export class UserService extends ApiService<AuthApiData> {

  constructor(
    protected override http: HttpClient,
    private authService: AuthService,
  ) {
    super(http)
  }

  getUser() {
    return this.get('/users/getUserById/'+ this.authService.currentUserValue?.id).pipe(tap((res:any)=> {
      if(!res.hasErrors()) {
        this.authService.updateUser(res.data)
      }
    }))
  }

  updateBusinessHours(params : {businessHours: BusinessHours[]}){
    return this.post('/users/updateBusinessHours',{id: this.authService.currentUserValue?.id ,...params})
  }

  updateIBAN(merchantID: string | any, iban: string) {
    return this.post(`/users/completeKYC/${merchantID}`, {iban})
  }

  updateMerchantprofile(param:any) {
    const id = this.authService.currentUserValue?.id;
    return this.post(`/users/updateMerchantprofile/${id}`, param)
  }

  updatePinCode(voucherPinCode: any): Observable<ApiResponse<any>> {
    const id = this.authService.currentUserValue?.id;
    return this.post(`/users/updateVoucherPinCode/${id}`, {voucherPinCode});
  }

  updateLocation(param: any) {
    const merchantId = this.authService.currentUserValue?.userID;
    return this.post(`/location/updateLocation/${merchantId}`, param);
  }
}
