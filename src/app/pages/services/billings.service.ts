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

  getAllInvoicesByMerchantID(merchantID: string, offset: any, limit: any, data: {
    invoiceDate: string;
    invoiceAmount: string;
    dateFrom: number;
    dateTo: number;
  }): Observable<ApiResponse<billingData>> {
    const param: any = {
      offset: offset,
      limit: limit
    }
    if(data.invoiceAmount) param.invoiceAmount = data.invoiceAmount;
    if(data.invoiceDate) param.invoiceDate = data.invoiceDate;
    if(data.dateFrom) param.dateFrom = data.dateFrom;
    if(data.dateTo) param.dateTo = data.dateTo;
    return this.get(`/invoices/getAllInvoicesByMerchant/${merchantID}`, param);
  }

  completeKYC(payload: KYC): Observable<ApiResponse<any>> {
   return this.post(`/users/completeKYC`, payload);
  }

  getMerchantStats(merchantID: string): Observable<ApiResponse<any>> {
    return this.get(`/users/getMerchantStats/${merchantID}`);
  }

}
