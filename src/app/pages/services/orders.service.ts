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

  getAllOrdersByID(id: string, offset: any, limit: any): Observable<ApiResponse<OrdersData>> {
    limit = parseInt(limit) < 1 ? 10 : limit;
    offset = parseInt(offset) < 0 ? 0 : offset;
    return this.get(`/orders/getAllOrderByMerchant/${id}?offset=${offset}&limit=${limit}`)
  }
}
