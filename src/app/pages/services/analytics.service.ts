import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { ApiService } from '@core/services/api.service';
import { Observable } from 'rxjs';
import { NetRevenue, SoldVouchers } from 'src/app/modules/wizards/models/revenue.model';
import { MainDeal } from './../../modules/wizards/models/main-deal.model';

@Injectable({
  providedIn: 'root'
})

export class AnalyticsService extends ApiService<any> {

  constructor(protected override http: HttpClient) {
    super(http)
  }

  getNetRevenue(): Observable<ApiResponse<NetRevenue>> {
    return this.get('/voucher/getNetRevenue');
  }

  getVoucherSoldPerDay(days: number): Observable<ApiResponse<SoldVouchers[]>> {
    return this.get(`/voucher/getVoucherSoldPerDay/${days}`);
  }

  getPublishedDeals(page: number, limit: any): Observable<ApiResponse<MainDeal>> {
    page--;
    const params: any = {
      limit: limit,
      offset: page ? limit * page : 0
    }
    return this.get(`/deal/getPublishedDealsForMerchant`, params)
  }
}
