import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { ApiService } from '@core/services/api.service';
import { Observable } from 'rxjs';
import { BillingList } from 'src/app/modules/wizards/models/billing-list.model';

type billingData = BillingList

@Injectable({
  providedIn: 'root'
})
export class BillingsService extends ApiService<billingData> {

  constructor(protected override http: HttpClient) {
    super(http)
  }

  getAllBillings(offset: any, limit: any): Observable<ApiResponse<billingData>> {
    limit = parseInt(limit) < 1 ? 10 : limit;
    offset = parseInt(offset) < 0 ? 0 : offset;
    return this.get(`/billing/getAllBillings?offset=${offset}&limit=${limit}`)
  }

  getAllBillingsByMerchantID(merchantID:string, offset: any, limit: any): Observable<ApiResponse<billingData>> {
    limit = parseInt(limit) < 1 ? 10 : limit;
    offset = parseInt(offset) < 0 ? 0 : offset;
    return this.get(`/billing/getBillingsByMerchant/${merchantID}?offset=${offset}&limit=${limit}`)
  }
}
