import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { Observable } from 'rxjs';
import { Deals, MainDeal } from './../../modules/wizards/models/main-deal.model';
import { ApiService } from './api.service';

type deal = MainDeal | Deals
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

  getDeals(merchantID: string, offset: any, limit: any, data: {
    title: string;
    price: string;
    startDate: string;
    endDate: string;
    dateFrom: number;
    dateTo: number;
  }): Observable<ApiResponse<deal>> {
    const param: any = {
      offset: offset,
      limit: limit
    }
    if(data.title) param.title = data.title;
    if(data.price) param.price = data.price;
    if(data.startDate) param.startDate = data.startDate;
    if(data.endDate) param.endDate = data.endDate;
    if(data.dateFrom) param.dateFrom = data.dateFrom;
    if(data.dateTo) param.dateTo = data.dateTo;
    return this.get(`/deal/getDealsByMerchantID/${merchantID}`, param);
  }
}
