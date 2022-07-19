import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { ApiService } from '@core/services/api.service';
import { Observable } from 'rxjs';
import { BillingList } from 'src/app/modules/wizards/models/billing-list.model';
import { KYC } from 'src/app/modules/wizards/models/kyc.model';

type billingData = BillingList

@Injectable({
  providedIn: 'root'
})
export class BillingsService extends ApiService<billingData> {

  constructor(protected override http: HttpClient) {
    super(http)
  }

  getAllInvoicesByMerchantID(
    page: number,
    merchantID: string | any,
    offset: any,
    limit: any,
    invoiceID: string,
    dateFrom: string,
    dateTo: string,
    data: {
      invoiceIDsArray: string[];
  }): Observable<ApiResponse<billingData>> {
    page--;
    offset = page ? limit * page : 0;
    limit = limit;
    return this.post(`/invoices/getAllInvoicesByMerchant/${merchantID}?invoiceID=${invoiceID}&dateFrom=${dateFrom}&dateTo=${dateTo}&offset=${offset}&limit=${limit}`, data);
  }

  completeKYC(merchantID: string | any, payload: KYC): Observable<ApiResponse<any>> {
   return this.post(`/users/completeKYC/${merchantID}`, payload);
  }

  getMerchantStats(merchantID: string | any): Observable<ApiResponse<any>> {
    return this.get(`/users/getMerchantStats/${merchantID}`);
  }

}
