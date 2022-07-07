import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
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
    return this.post('/deal/createDeal', deal).pipe(tap((res: any) => {
      console.log(res);
    }));
  }

  getTopRatedDeals(merchantID: string | any): Observable<ApiResponse<deal>> {
    return this.get(`/deal/getTopRatedDeals/${merchantID}`);
  }

  getSalesStats(): Observable<ApiResponse<any>> {
    return this.get(`/deal/getSalesStatistics`);
  }

  getDeals(page: number, merchantID: string | any, offset: any, limit: any, data: {
    title: string;
    price: string;
    startDate: string;
    endDate: string;
    dateFrom: number;
    dateTo: number;
    status: string;
  }): Observable<ApiResponse<deal>> {
    page--;
    const param: any = {
      offset: page ? limit * page : 0,
      limit: limit
    }
    if(data.title) param.title = data.title;
    if(data.price) param.price = data.price;
    if(data.startDate) param.startDate = data.startDate;
    if(data.endDate) param.endDate = data.endDate;
    if(data.dateFrom) param.dateFrom = data.dateFrom;
    if(data.dateTo) param.dateTo = data.dateTo;
    if(data.status) param.status = data.status
    return this.get(`/deal/getDealsByMerchantID/${merchantID}`, param);
  }

  deleteDeal(dealID: string): Observable<ApiResponse<any>> {
    return this.post(`/deal/deleteDeal/${dealID}`).pipe(tap((res: any) => {
      console.log(res);
    }))
  }

  getDealByID(dealID: string): Observable<ApiResponse<any>> {
    return this.get(`/deal/getDeal/${dealID}`).pipe(tap((res: any) => {
      console.log(res);
    }))
  }
}
