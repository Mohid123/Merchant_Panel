import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiResponse } from '@core/models/response.model';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { OrdersService } from '@pages/services/orders.service';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { OrdersList } from 'src/app/modules/wizards/models/order-list.model';

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
  hoveredDate: NgbDate | any = null;
  fromDate: NgbDate | any;
  toDate: NgbDate | any = null;
  deal: string;
  amount: number;
  status: string;
  paymentStatus: string;
  searchControl = new FormControl();
  noRecordFound: boolean = false;
  statsData: any;


  constructor(
    private orderService: OrdersService,
    private cf: ChangeDetectorRef,
    private authService: AuthService,
    calendar: NgbCalendar
    ) {
      this.fromDate = calendar.getToday();
      this.toDate = calendar.getNext(calendar.getToday(), 'd', 0);
    }

  ngOnInit(): void {
    this.authService.retreiveUserValue();
    this.getVouchersByMerchant();
    this.searchControl.valueChanges.pipe(takeUntil(this.destroy$),debounceTime(1000))
      .subscribe(newValue => {
        if (newValue.trim().length == 0 || newValue == "") {
          this.noRecordFound = false;
          this.getVouchersByMerchant();
        } else {
          this.searchVoucher(newValue);
        }
      });
  }

  getVouchersByMerchant() {
    this.showData = false;
    const params: any = {
      deal: this.deal,
      amount: this.amount,
      status: this.status,
      paymentStatus: this.paymentStatus,
      dateFrom: new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day).getTime(),
      dateTo: new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day).getTime()
    }

    this.orderService.getVouchersByMerchantID(this.authService.merchantID, this.offset, this.limit, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<OrdersList>) => {
      if(!res.hasErrors()) {
        this.ordersData = res.data;
        this.cf.detectChanges();
        this.showData = true;
      }
    })
  }

  filterByDeal(deal: string) {
    this.offset = 0;
    this.deal = deal;
    this.getVouchersByMerchant();
  }

  filterByAmount(amount: number) {
    this.offset = 0;
    this.amount = amount;
    this.getVouchersByMerchant();
  }

  filterByStatus(status: string) {
    this.offset = 0;
    this.status = status;
    this.getVouchersByMerchant();
  }

  filterByPaymentStatus(paymentStatus: string) {
    this.offset = 0;
    this.paymentStatus = paymentStatus;
    this.getVouchersByMerchant();
  }

  filterByDate(dateFrom: number, dateTo: number) {
    this.offset = 0;
    this.fromDate = dateFrom;
    this.toDate = dateTo;
    this.getVouchersByMerchant();
  }

  searchVoucher(voucherID: number) {
    this.orderService.searchByVoucherID(voucherID)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res:ApiResponse<any>) => {
      if(!res.hasErrors() && res.data.length  > 0) {
        debugger
        if(res.data.length == 0) {
          debugger
          this.ordersData = res.data;
          this.cf.detectChanges();
          this.noRecordFound = true;
        }
        else if(res.data.length > 0){
          debugger
          this.ordersData = res.data;
          this.cf.detectChanges();
          this.noRecordFound = false;
        }
      }
    })
  }

  getMerchantStatsForVouchers() {
    this.orderService.getMerchantStatistics(this.authService.merchantID, this.offset, this.limit)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.statsData = res.data;
        this.cf.detectChanges();
      }
    })
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
