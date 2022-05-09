import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { ApiService } from '@core/services/api.service';
import { Observable } from 'rxjs';
import { OrdersList } from 'src/app/modules/wizards/models/order-list.model';

type OrdersData = OrdersList
@Injectable({
  providedIn: 'root'
})
export class OrdersService extends ApiService<OrdersData> {

  constructor(protected override http: HttpClient) {
    super(http)
  }

  getVouchersByMerchantID(merchantID: string, offset: any, limit: any, data: {
    deal: string,
    amount: string,
    status: string,
    paymentStatus: string,
    dateFrom: number,
    dateTo: number
    }): Observable<ApiResponse<OrdersData>> {
    const param: any = {
      offset: offset,
      limit: limit
    }
    if(data.deal) param.deal = data.deal;
    if(data.amount) param.amount = data.amount;
    if(data.status) param.status = data.status;
    if(data.paymentStatus) param.paymentStatus = data.paymentStatus;
    if(data.dateFrom) param.dateFrom = data.dateFrom;
    if(data.dateTo) param.dateTo = data.dateTo
    return this.get(`/voucher/getAllVouchersByMerchantID/${merchantID}`, param);
  }


  searchByVoucherID(voucherID: number): Observable<ApiResponse<any>> {
   return this.get(`/voucher/searchByVoucherId/${voucherID}`);
  }

  getMerchantStatistics(merchantID: string, offset: any, limit: any): Observable<ApiResponse<any>> {
    const param: any = {
      offset: offset,
      limit: limit
    }
    return this.get(`/deal/getDealsReviewStatsByMerchant/${merchantID}`, param);
  }
}
