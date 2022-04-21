import { Component, OnInit } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { OrdersService } from '@pages/services/orders.service';
import { Orders } from './../../modules/wizards/models/order.model';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit {

  ordersData: Orders;
  offset: number = 0;
  limit: number = 10


  // DUMMY DATA FOR SORT TESTING
  public orderData: Array<Orders> = [
    {
      orderID: '1',
      customerName: 'Junaid',
      date: '20-10-1998',
      amount: '345',
      fee: '212',
      net: '287',
      source: 'Stripe',
      status: 'Purchased'
    },
    {
      orderID: '2',
      customerName: 'Mohid',
      date: '20-10-2021',
      amount: '425',
      fee: '446',
      net: '987',
      source: 'Stripe',
      status: 'Redeemed'
    },
    {
      orderID: '3',
      customerName: 'Mudassar',
      date: '20-10-2018',
      amount: '345',
      fee: '440',
      net: '1087',
      source: 'Stripe',
      status: 'Purchased'
    },
    {
      orderID: '4',
      customerName: 'Sameer',
      date: '20-10-1994',
      amount: '445',
      fee: '846',
      net: '987',
      source: 'Stripe',
      status: 'Redeemed'
    }
  ]

  constructor(private orderService: OrdersService) { }

  ngOnInit(): void {
    this.getOrders();
  }

  getOrders() {
    this.orderService.getAllOrders(this.offset, this.limit).subscribe((res:ApiResponse<Orders>) => {
      debugger
      this.ordersData = res.data;
      console.log(res.data)
    })
  }

}
