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

  getAllInvoicesByMerchantID(page: number, merchantID: string | any, offset: any, limit: any, data: {
    invoiceDate: string;
    invoiceAmount: string;
    dateFrom: number;
    dateTo: number;
    status: string;
  }): Observable<ApiResponse<billingData>> {
    page--;
    const param: any = {
      offset: page ? limit * page : 0,
      limit: limit
    }
    if(data.invoiceAmount) param.invoiceAmount = data.invoiceAmount;
    if(data.invoiceDate) param.invoiceDate = data.invoiceDate;
    if(data.status) param.status = data.status;
    if(data.dateFrom) param.dateFrom = data.dateFrom;
    if(data.dateTo) param.dateTo = data.dateTo;
    return this.get(`/invoices/getAllInvoicesByMerchant/${merchantID}`, param);
  }

  completeKYC(merchantID: string | any, payload: KYC): Observable<ApiResponse<any>> {
   return this.post(`/users/completeKYC/${merchantID}`, payload);
  }

  getMerchantStats(merchantID: string | any): Observable<ApiResponse<any>> {
    return this.get(`/users/getMerchantStats/${merchantID}`);
  }

}
