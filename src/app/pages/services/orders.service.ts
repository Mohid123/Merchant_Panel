import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { ApiService } from '@core/services/api.service';
import { Observable } from 'rxjs';
import { OrdersList } from 'src/app/modules/wizards/models/order-list.model';
import { AuthService } from './../../modules/auth/services/auth.service';

type OrdersData = OrdersList
@Injectable({
  providedIn: 'root'
})
export class OrdersService extends ApiService<OrdersData> {

  constructor(protected override http: HttpClient, private authService: AuthService) {
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
    voucher: string,
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
    return this.post(`/voucher/getAllVouchersByMerchantID/${merchantID}?deal=${deal}&voucher=${voucher}&voucherID=${voucherID}&dealHeader=${dealHeader}&voucherHeader=${voucherHeader}&voucherStatus=${voucherStatus}&invoiceStatus=${invoiceStatus}&offset=${offset}&limit=${limit}`, data);
  }


  searchByVoucherID(voucherID: string, offset: any, limit: any): Observable<ApiResponse<any>> {
   const merchantID = this.authService.currentUserValue?.id;
   return this.get(`/voucher/searchByVoucherId/${merchantID}?voucherId=${voucherID}&offset=${offset}&limit=${limit}`);
  }

  getMerchantStatistics(merchantID: string | any, offset: any, limit: any): Observable<ApiResponse<any>> {
    const param: any = {
      offset: offset,
      limit: limit
    }
    return this.get(`/deal/getDealsReviewStatsByMerchant/${merchantID}`, param);
  }
}
