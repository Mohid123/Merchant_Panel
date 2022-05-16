import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '@core/models/user.model';
import { ApiService } from '@core/services/api.service';
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
        this.authService.updateUser(res.data[0])
      }
    }))
  }

  updateBusinessHours(params : {businessHours: BusinessHours[]}){
    return this.post('/users/updateBusinessHours',{id:this.authService.currentUserValue?.id ,...params})
  }

  updateIBAN(param : {iban:string}) {
    return this.post('/users/completeKYC',{id:this.authService.currentUserValue?.id, ...param})
  }

  updateMerchantprofile(param:any) {
    param.id=this.authService.currentUserValue?.id;
    return this.post('/users/updateMerchantprofile',param)
  }
}
