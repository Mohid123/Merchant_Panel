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

  getVouchersByMerchantID(
    page: number,
    merchantID: string | any,
    offset: any,
    limit: any,
    voucherID: string,
    dealHeader: string,
    voucherHeader: string,
    voucherStatus: string,
    invoiceStatus: string,

    deal: string,
    data: {
      voucherIDsArray: string[];
      dealHeaderArray: string[];
      voucherHeaderArray: string[];
      voucherStatusArray: string[];
      invoiceStatusArray: string[];
    }): Observable<ApiResponse<OrdersData>> {
    page--;
    offset = page ? limit * page : 0;
    limit = limit
    return this.post(`/voucher/getAllVouchersByMerchantID/${merchantID}?deal=${deal}&voucherID=${voucherID}&dealHeader=${dealHeader}&voucherHeader=${voucherHeader}&voucherStatus=${voucherStatus}&invoiceStatus=${invoiceStatus}&offset=${offset}&limit=${limit}`, data);
  }


  searchByVoucherID(voucherID: number): Observable<ApiResponse<any>> {
   return this.get(`/voucher/searchByVoucherId/${voucherID}`);
  }

  getMerchantStatistics(merchantID: string | any, offset: any, limit: any): Observable<ApiResponse<any>> {
    const param: any = {
      offset: offset,
      limit: limit
    }
    return this.get(`/deal/getDealsReviewStatsByMerchant/${merchantID}`, param);
  }
}
