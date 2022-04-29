import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { Observable } from 'rxjs';
import { MainDeal } from './../../modules/wizards/models/main-deal.model';
import { ApiService } from './api.service';

type deal = MainDeal
@Injectable({
  providedIn: 'root'
})
export class DealService extends ApiService<deal> {

  constructor(
    protected override http: HttpClient,
  ) {
    super(http);
  }

  createDeal(deal: MainDeal) {
    console.log('deal:',deal);
    console.log('deal string:',JSON.stringify(deal));

    return this.post('/deal/createDeal',deal);
  }

  getTopRatedDeals(merchantID: string): Observable<ApiResponse<deal>> {
    return this.get(`/deal/getTopRatedDeals/${merchantID}`);
  }

  getSalesStats(): Observable<ApiResponse<any>> {
    return this.get(`/deal/getSalesStatistics`);
  }
}
