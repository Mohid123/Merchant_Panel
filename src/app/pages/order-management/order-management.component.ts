import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { getItem, StorageItem } from '@core/utils';
import { OrdersService } from '@pages/services/orders.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrdersList } from 'src/app/modules/wizards/models/order-list.model';
import { User } from '../../@core/models/user.model';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit {

  merchantID: string;
  showData: boolean;
  ordersData: OrdersList;
  offset: number = 0;
  limit: number = 10;
  destroy$ = new Subject();
  private _User$ = new BehaviorSubject<any>(getItem(StorageItem.User));
  public readonly User$: Observable<any> = this._User$.asObservable();

  constructor(private orderService: OrdersService, private cf: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.retreiveUserValue();
    this.getOrdersByMerchant();
  }

  get user(): User {
    return this._User$.getValue();
  }

  retreiveUserValue() {
    this.User$.subscribe((res:User) => {
      this.merchantID = res.id;
    })
  }

  getOrdersByMerchant() {
    this.showData = false;
    this.orderService.getAllOrdersByID(this.merchantID, this.offset, this.limit)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res:ApiResponse<OrdersList>) => {
      debugger
      this.ordersData = res.data;
      this.showData = true;
      this.cf.detectChanges();
    })
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
