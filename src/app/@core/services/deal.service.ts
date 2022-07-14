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

  getDeals(
    page: number,
    merchantID: string | any,
    offset: any,
    limit: any,
    dealID: string[],
    header: string[],
    dealStatus: string[],
    data: {
      dealIDsArray: string[];
      dealHeaderArray: string[];
      dealStatusArray: string[];
    }): Observable<ApiResponse<deal>> {
    page--;
    const param: any = {
      dealIDsArray: [],
      dealHeaderArray: [],
      dealStatusArray: []
    }
    if(data.dealIDsArray) param.dealIDsArray = data.dealIDsArray;
    if(data.dealHeaderArray) param.dealHeaderArray = data.dealHeaderArray;
    if(data.dealStatusArray) param.dealStatusArray = data.dealStatusArray;
    return this.post(`/deal/getDealsByMerchantID/${merchantID}?dealID=${dealID}&header=${header}&dealStatus=${dealStatus}&offset=${offset}&limit=${limit}`, param);
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
