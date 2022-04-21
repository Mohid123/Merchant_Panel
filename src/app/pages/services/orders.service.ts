import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { ApiService } from '@core/services/api.service';
import { Observable } from 'rxjs';
import { Orders } from './../../modules/wizards/models/order.model';

type OrdersData = Orders
@Injectable({
  providedIn: 'root'
})
export class OrdersService extends ApiService<OrdersData> {

  constructor(protected override http: HttpClient) {
    super(http)
  }

  getAllOrders(offset: any, limit: any): Observable<ApiResponse<OrdersData>> {
    limit = parseInt(limit) < 1 ? 10 : limit;
    offset = parseInt(offset) < 0 ? 0 : offset;
    return this.get(`/billing/getAllBillings?offset=${offset}&limit=${limit}`)
  }

  getAllOrdersByID(id: string, offset: any, limit: any): Observable<ApiResponse<OrdersData>> {
    limit = parseInt(limit) < 1 ? 10 : limit;
    offset = parseInt(offset) < 0 ? 0 : offset;
    return this.get(`/billing/getBillingsByMerchant/${id}?offset=${offset}&limit=${limit}`)
  }
}
