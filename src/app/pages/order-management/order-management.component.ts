import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiResponse } from '@core/models/response.model';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { BillingsService } from '@pages/services/billings.service';
import { OrdersService } from '@pages/services/orders.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { OrdersList } from 'src/app/modules/wizards/models/order-list.model';
import { Orders } from 'src/app/modules/wizards/models/order.model';
import { MerchantStats } from './../../modules/wizards/models/merchant-stats.model';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit, OnDestroy {

  merchantID: string;
  showData: boolean;
  ordersData: OrdersList | any;
  offset: number = 0;
  limit: number = 7;
  page: number;
  destroy$ = new Subject();
  hoveredDate: NgbDate | any = null;
  fromDate: NgbDate | any;
  toDate: NgbDate | any = null;
  deal : string = '';
  amount: string;
  status: string;
  paymentStatus: string;
  searchControl = new FormControl();
  noRecordFound: boolean = false;
  statsData: any;
  statsLoading: boolean;
  voucherStats: MerchantStats;

  filteredResult: any;
  filteredVoucherID: any;
  filteredDealHeader: any;
  filteredStatusResult: any;


  voucherID: string = '';
  dealHeader: string = '';
  voucherHeader: string = '';
  voucherStatus: string = '';
  invoiceStatus: string = '';

  voucherIDsFilter : any;
  dealHeadersFilters: any;
  voucherHeadersFilters: any;
  voucherStatusesFilters: any;
  invoiceStatusesFilters: any;
  filteredVoucherName: any;
  filteredInvoiceStatus: any;

  statusTypes = [
    {
      status: 'Purchased'
    },
    {
      status: 'Redeemed'
    },
    {
      status: 'Expired'
    },
    {
      status: 'Refunded'
    },
    {
      status: 'In dispute'
    }
  ];

  paymentTypes = [
    {
      paymentStatus: 'Paid'
    },
    {
      paymentStatus: 'UnPaid'
    },
    {
      paymentStatus: 'Pending'
    },
    {
      paymentStatus: 'Cancelled'
    }
  ]


  constructor(
    private orderService: OrdersService,
    private cf: ChangeDetectorRef,
    private authService: AuthService,
    private calendar: NgbCalendar,
    private billingService: BillingsService
    ) {
      this.page = 1;
      this.fromDate = '';
      this.toDate = '';
    }

  ngOnInit(): void {
    this.authService.currentUserValue?.id;
    this.getVouchersByMerchant();
    this.getMerchantStats();
   }

  getVouchersByMerchant() {
    this.showData = false;
    const params: any = {}
    debugger
    this.orderService.getVouchersByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.voucherID, this.dealHeader, this.voucherHeader, this.voucherStatus, this.invoiceStatus, this.deal, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<OrdersList>) => {
      if(!res.hasErrors()) {
        this.ordersData = res.data;
        console.log(this.ordersData);
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }
  applyFilter() {
    this.showData = false;
    const params: any = {
      voucherIDsArray : this.voucherIDsFilter?.filterData ? this.voucherIDsFilter?.filterData : [],
      dealHeaderArray: this.dealHeadersFilters?.filterData ? this.dealHeadersFilters?.filterData : [],
      voucherHeaderArray: this.voucherHeadersFilters?.filterData ? this.voucherHeadersFilters?.filterData : [],
      voucherStatusArray: this.voucherStatusesFilters?.filterData ? this.voucherStatusesFilters?.filterData : [],
      invoiceStatusArray: this.invoiceStatusesFilters?.filterData ? this.invoiceStatusesFilters?.filterData: [],
    }
     this.orderService.getVouchersByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, '', '', '', '', '', this.deal, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<OrdersList>) => {

      if(!res.hasErrors()) {
        this.ordersData = res.data;
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }

  filterByVoucherID(voucherID: string) {
    this.offset = 0;
    this.voucherID = voucherID;
    const params: any = {}
    if(this.voucherID != '') {
      this.orderService.getVouchersByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.voucherID, this.dealHeader, this.voucherHeader, this.voucherStatus, this.invoiceStatus, this.deal, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        debugger
        if(!res.hasErrors()) {
        this.cf.detectChanges();
         this.filteredVoucherID = res.data.data.map((filtered: Orders) => {
          console.log(this.filteredResult)
          return {
            id: filtered.id,
            value: filtered.voucherID,
            checked: false
          }
         })
         this.cf.detectChanges();
        }
      })
    }
    else {
      this.filteredVoucherID.length = 0;
    }

  }

  filterByDealHeader(dealHeader: string) {
    this.offset = 0;
    this.dealHeader = dealHeader;
    const params: any = {}
     if(this.dealHeader != '') {
      this.orderService.getVouchersByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.voucherID, this.dealHeader, this.voucherHeader, this.voucherStatus, this.invoiceStatus, this.deal, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        debugger
        if(!res.hasErrors()) {
        this.cf.detectChanges();
         this.filteredDealHeader = res.data.data.map((filtered: Orders) => {
          console.log(this.filteredDealHeader)
          return {
            id: filtered.id,
            value: filtered.dealHeader,
            checked: false
          }
         })
         this.cf.detectChanges();
        }
      })
    }
    else {
      this.filteredDealHeader.length = 0;
    }

  }

  filterSelectedDealByVoucherHeader(options: string) {
   this.showData = false;
    this.voucherHeadersFilters = options;
    this.applyFilter();
  }
  filterSelectedStatus(options: string) {
   this.showData = false;
    this.voucherStatusesFilters = options;
    this.applyFilter();
  }
  filterSelectedInvoiceStatus(options: string) {
   this.showData = false;
    this.invoiceStatusesFilters = options;
    this.applyFilter();
  }



  filterByVoucherHeader(voucherHeader: string) {
    this.offset = 0;
    this.voucherHeader = voucherHeader;
    const params: any = {}
    if(this.voucherHeader != '') {
      this.orderService.getVouchersByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.voucherID, this.dealHeader, this.voucherHeader, this.voucherStatus, this.invoiceStatus, this.deal, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        debugger
        if(!res.hasErrors()) {
        this.cf.detectChanges();
         this.filteredVoucherName = res.data.data.map((filtered: Orders) => {
          console.log(this.filteredVoucherName)
          return {
            id: filtered.id,
            value: filtered.voucherHeader,
            checked: false
          }
         })
         this.cf.detectChanges();
        }
      })
    }
    else {
      this.filteredVoucherName.length = 0;
    }
   }
  filterByTitle(deal: any) {
    this.limit = 7;
    this.deal = deal;
    this.applyFilter();
  }
  filterByVoucherName(deal: any) {
    this.limit = 7;
    this.deal = deal;
    this.applyFilter();
  }
  filterByStatusName(deal: any) {
    this.limit = 7;
    this.deal = deal;
    this.applyFilter();
  }

  filterSelectedVoucherByID(options: any) {
    this.showData = false;
    this.voucherIDsFilter = options;
    this.applyFilter();
  }

  filterSelectedDealByHeader(options: any) {
    this.showData = false;
    this.dealHeadersFilters = options;
    this.applyFilter();
  }

  getMerchantStats() {
    this.statsLoading = false;
    this.billingService.getMerchantStats(this.authService.currentUserValue?.id)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<MerchantStats>) => {
      //
      if(!res.hasErrors()) {
        this.voucherStats = res.data;
        this.statsLoading = true;
        this.cf.detectChanges();
      }
    })
  }

  filterByDeal(deal: string) {
    this.offset = 0;
    if(this.deal == '' || this.deal == 'Descending') {
      this.deal = 'Ascending'
    }
    else {
      this.deal = deal
    }
    this.getVouchersByMerchant();
  }

  filterByAmount(amount: string) {
    this.offset = 0;
    if(this.amount == '' || this.amount == 'Descending') {
      this.amount = 'Ascending'
    }
    else {
      this.amount = amount;
    }
    this.getVouchersByMerchant();
  }

  filterByStatus(voucherStatus: string) {
    debugger
    this.offset = 0;
    this.voucherStatus = voucherStatus;
    const params: any = {}
    if(this.voucherStatus != '') {
      this.orderService.getVouchersByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.voucherID, this.dealHeader, this.voucherHeader, this.voucherStatus, this.invoiceStatus, this.deal, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        debugger
        if(!res.hasErrors()) {
        this.cf.detectChanges();
         this.filteredStatusResult = res.data.data.map((filtered: Orders) => {
          console.log(this.filteredStatusResult)
          return {
            id: filtered.id,
            value: filtered.status,
            checked: false
          }
         })
         this.cf.detectChanges();
        }
      })
    } else {
      this.filteredStatusResult.length = 0;
    }
  }
  filterByInvoiceStatus(invoiceStatus: string) {
    this.offset = 0;
    this.invoiceStatus = invoiceStatus;
    const params: any = {}
    if(this.invoiceStatus != '') {
      this.orderService.getVouchersByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.voucherID, this.dealHeader, this.voucherHeader, this.voucherStatus, this.invoiceStatus, this.deal, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        debugger
        if(!res.hasErrors()) {
        this.cf.detectChanges();
         this.filteredInvoiceStatus = res.data.data.map((filtered: Orders) => {
          console.log(this.filteredInvoiceStatus)
          return {
            id: filtered.id,
            value: filtered.paymentStatus,
            checked: false
          }
         })
         this.cf.detectChanges();
        }
      })
    } else {
      this.filteredInvoiceStatus.length = 0;
    }
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
      if(!res.hasErrors()) {
        if(!res.data) {
          this.ordersData = res.data;
          // this.noRecordFound = true;
          this.cf.detectChanges();
        }
        else {
          this.ordersData = res;
          // this.noRecordFound = false;
          this.cf.detectChanges();
        }
      }
    })
  }

  getMerchantStatsForVouchers() {
    this.orderService.getMerchantStatistics(this.authService.currentUserValue?.id, this.offset, this.limit)
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

  resetFilters() {
    // this.offset = 0;
    this.limit = 7;
    this.voucherIDsFilter = [];
    this.dealHeadersFilters = [];
    this.invoiceStatusesFilters = [];
    this.voucherHeadersFilters = [];
    this.voucherStatusesFilters = [];
    this.voucherID = '';
    this.dealHeader = '';
    this.deal = '';
    this.voucherHeader = '';
    this.voucherStatus = '';
    this.invoiceStatus = '';
    this.getVouchersByMerchant();
  }

  next():void {
    this.page;
    this.getVouchersByMerchant();
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
