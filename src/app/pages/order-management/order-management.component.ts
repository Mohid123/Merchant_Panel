import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ModalConfig } from '@core/models/modal.config';
import { ApiResponse } from '@core/models/response.model';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { BillingsService } from '@pages/services/billings.service';
import { CommonFunctionsService } from '@pages/services/common-functions.service';
import { OrdersService } from '@pages/services/orders.service';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { OrdersList } from 'src/app/modules/wizards/models/order-list.model';
import { Orders } from 'src/app/modules/wizards/models/order.model';
import { MerchantStats } from './../../modules/wizards/models/merchant-stats.model';
import { ReusableModalComponent } from './../../_metronic/layout/components/reusable-modal/reusable-modal.component';

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
  searchPage: number;
  destroy$ = new Subject();
  hoveredDate: NgbDate | any = null;
  fromDate: NgbDate | any;
  toDate: NgbDate | any = null;
  deal : string = '';
  voucherheader: string = '';
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
  filteredVoucherIDSearch: any[] = [];
  filteredDealHeader: any;
  filteredDealHeaderSearch: any[] = [];
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
  filteredVoucherNameSearch: any[] = [];
  filteredInvoiceStatus: any;
  appliedFilterID: boolean;
  appliedFilterHeader: boolean;
  appliedFilterVoucherHeader: boolean;
  appliedFilterStatus: boolean;
  appliedFilterPaymentStatus: boolean;
  temporaryHeader: any;

  buttonToSearch: boolean = false;

  statusTypes = [
    {
      id: 0,
      status: 'Purchased'
    },
    {
      id: 1,
      status: 'Redeemed'
    },
    {
      id: 2,
      status: 'Expired'
    },
    {
      id: 3,
      status: 'Refunded'
    },
    {
      id: 4,
      status: 'In dispute'
    }
  ];

  paymentTypes = [
    {
      id: 1,
      paymentStatus: 'Paid'
    },
    {
      id: 2,
      paymentStatus: 'Cooling off'
    },
    {
      id: 3,
      paymentStatus: 'Credited'
    },
    {
      id: 4,
      paymentStatus: 'In process'
    }
  ];

  valuesAvailable: boolean = false;
  voucherSearchValues: Observable<Orders[]>;
  singleVoucher: Observable<Orders | any>;
  @ViewChild('modal') private modal: ReusableModalComponent;
  public modalConfig: ModalConfig = {
    onDismiss: () => {
      return true
    },
    dismissButtonLabel: "Dismiss",
    onClose: () => {
      return true
    },
    closeButtonLabel: "Close"
  }


  constructor(
    private orderService: OrdersService,
    private cf: ChangeDetectorRef,
    private authService: AuthService,
    private calendar: NgbCalendar,
    private billingService: BillingsService,
    private commonService: CommonFunctionsService
    ) {
      this.page = 1;
      this.fromDate = '';
      this.toDate = '';
    }

  ngOnInit(): void {
    this.authService.currentUserValue?.id;
    this.getVouchersByMerchant();
    this.getMerchantStats();
    this.filterByVoucherID('');
    this.filterByVoucherHeader('');
    this.filterByDealHeader('');
    this.filteredStatusResult = this.statusTypes.map((filtered: any) => {
      return {
        id: filtered.id,
        value: filtered.status,
        checked: false
      }
    });

    this.filteredInvoiceStatus = this.paymentTypes.map((filtered: any) => {
      return {
        id: filtered.id,
        value: filtered.paymentStatus,
        checked: false
      }
    });

    this.searchControl.valueChanges.pipe(debounceTime(800)).subscribe((value: string) => {
      if(value != '' || value.length > 0) {
        this.orderService.searchByVoucherID(value, 0, 10).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
          if(!res.hasErrors()) {
            console.log(res.data)
            const voucherData = res.data.data;
            this.voucherSearchValues = of(voucherData);
            this.valuesAvailable = true;
            this.cf.detectChanges();
          }
        })
      }
    })

  }

  getVouchersByMerchant() {
    this.showData = false;
    const params: any = {
      voucherIDsArray : this.voucherIDsFilter?.filterData ? this.voucherIDsFilter?.filterData : [],
      dealHeaderArray: this.dealHeadersFilters?.filterData ? this.dealHeadersFilters?.filterData : [],
      voucherHeaderArray: this.voucherHeadersFilters?.filterData ? this.voucherHeadersFilters?.filterData : [],
      voucherStatusArray: this.voucherStatusesFilters?.filterData ? this.voucherStatusesFilters?.filterData : [],
      invoiceStatusArray: this.invoiceStatusesFilters?.filterData ? this.invoiceStatusesFilters?.filterData: [],
    }
    this.orderService.getVouchersByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.voucherID, this.dealHeader, this.voucherHeader, this.voucherStatus, this.invoiceStatus, this.deal, this.voucherheader, params)
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

  isFilterAppliedOnID(fiilterApplied: any) {
    this.appliedFilterID = fiilterApplied;
  }

  isFilterAppliedOnHeader(fiilterApplied: any) {
    this.appliedFilterHeader = fiilterApplied;
  }

  isFilterAppliedOnVoucherHeader(fiilterApplied: any) {
    this.appliedFilterVoucherHeader = fiilterApplied;
  }

  isFilterAppliedOnStatus(fiilterApplied: any) {
    this.appliedFilterStatus = fiilterApplied;
  }

  isFilterAppliedOnPaymentStatus(fiilterApplied: any) {
    this.appliedFilterPaymentStatus = fiilterApplied;
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
    // debugger
     this.orderService.getVouchersByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, '', '', '', '', '', this.deal, this.voucherheader, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<OrdersList>) => {
      if(!res.hasErrors()) {
        this.ordersData = res.data;
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }

  filterByVoucherID(voucherID: any) {
    this.offset = 0;
    this.searchPage = voucherID?.page ? voucherID?.page : 1;
    if(voucherID?.value != this.voucherID || voucherID?.value == '') {
      this.filteredVoucherIDSearch = [];
      this.commonService.optionsLengthIsZero = false;
    }
    this.voucherID = voucherID?.value ? voucherID?.value : '';
    const params: any = {};
    if(this.voucherID == '') {
      this.orderService.getVouchersByMerchantID(this.searchPage, this.authService.currentUserValue?.id, this.offset, 10, this.voucherID, this.dealHeader, this.voucherHeader, this.voucherStatus, this.invoiceStatus, this.deal, this.voucherheader, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.commonService.optionsLengthIsZero = false;
          this.cf.detectChanges();
          this.filteredVoucherID = res.data.data.map((filtered: Orders) => {
            return {
              id: filtered.id,
              value: filtered.voucherID,
              checked: false
            }
          })
          this.filteredVoucherIDSearch.push(...this.filteredVoucherID);
          this.commonService.finished = true;
          this.cf.detectChanges();
        }
      })
    }
    else {
      this.orderService.getVouchersByMerchantID(this.searchPage, this.authService.currentUserValue?.id, this.offset, 10, this.voucherID, this.dealHeader, this.voucherHeader, this.voucherStatus, this.invoiceStatus, this.deal, this.voucherheader, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          if(res.data?.totalCount >= this.offset) {
            this.commonService.finished = false;
            this.commonService.optionsLengthIsZero = false;
            this.cf.detectChanges();
            this.filteredVoucherID = res.data.data.map((filtered: Orders) => {
              return {
                id: filtered.id,
                value: filtered.voucherID,
                checked: false
              }
            })
            this.filteredVoucherIDSearch.push(...this.filteredVoucherID);
            this.cf.detectChanges();
          }
          else if(res.data?.totalCount <= this.offset) {
            this.commonService.finished = true
          }
        }
        if(res.data.data.length == 0) {
          this.commonService.optionsLengthIsZero = true;
          this.cf.detectChanges();
        }
      })
    }
  }

  filterByDealHeader(dealHeader: any) {
    this.offset = 0;
    this.searchPage = dealHeader?.page ? dealHeader?.page : 1;
    if(dealHeader?.value != this.dealHeader || dealHeader?.value == '') {
      this.filteredDealHeaderSearch = [];
      this.commonService.optionsLengthIsZero = false;
    }
    this.dealHeader = dealHeader?.value ? dealHeader?.value : '';
    const params: any = {}
    if(this.dealHeader == '') {
      this.orderService.getVouchersByMerchantID(this.searchPage, this.authService.currentUserValue?.id, this.offset, 10, this.voucherID, this.dealHeader, this.voucherHeader, this.voucherStatus, this.invoiceStatus, this.deal, this.voucherheader, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.commonService.optionsLengthIsZero = false;
          this.cf.detectChanges();
          const uniqueArray = this.commonService.getUniqueListBy(res.data.data, 'dealHeader');
          this.filteredDealHeader = uniqueArray.map((filtered: any) => {
            return {
              id: filtered.id,
              value: filtered.dealHeader,
              checked: false
            }
          });
          this.filteredDealHeaderSearch.push(...this.filteredDealHeader);
          this.commonService.finished = true;
          this.cf.detectChanges();
        }
      })
    }
    else {
      this.orderService.getVouchersByMerchantID(this.searchPage, this.authService.currentUserValue?.id, this.offset, 10, this.voucherID, this.dealHeader, this.voucherHeader, this.voucherStatus, this.invoiceStatus, this.deal, this.voucherheader, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          if(res.data?.totalCount >= this.offset) {
            this.commonService.finished = false;
            this.commonService.optionsLengthIsZero = false;
            this.cf.detectChanges();
            const uniqueArray = this.commonService.getUniqueListBy(res.data.data, 'dealHeader');
            this.filteredDealHeader = uniqueArray.map((filtered: any) => {
              return {
                id: filtered.id,
                value: filtered.dealHeader,
                checked: false
              }
            });
            this.filteredDealHeaderSearch.push(...this.filteredDealHeader);
            this.cf.detectChanges();
          }
          else if(res.data?.totalCount <= this.offset) {
            this.commonService.finished = true
          }
        }
        if(res.data.data.length == 0) {
          this.commonService.optionsLengthIsZero = true;
          this.cf.detectChanges();
        }
      })
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

  filterByVoucherHeader(voucherHeader: any) {
    this.offset = 0;
    this.searchPage = voucherHeader?.page ? voucherHeader?.page : 1;
    if(voucherHeader?.value != this.voucherHeader || voucherHeader?.value == '') {
      this.filteredVoucherNameSearch = [];
      this.commonService.optionsLengthIsZero = false;
    }
    this.voucherHeader = voucherHeader?.value ? voucherHeader?.value : '';
    const params: any = {};
    if(this.voucherHeader == '') {
      this.orderService.getVouchersByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, 10, this.voucherID, this.dealHeader, this.voucherHeader, this.voucherStatus, this.invoiceStatus, this.deal, this.voucherheader, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.commonService.optionsLengthIsZero = false;
          this.cf.detectChanges();
          const uniqueArray = this.commonService.getUniqueListBy(res.data.data, 'voucherHeader');
          this.filteredVoucherName = uniqueArray.map((filtered: any) => {
            return {
              id: filtered.id,
              value: filtered.voucherHeader,
              checked: false
            }
          })
          this.filteredVoucherNameSearch.push(...this.filteredVoucherName);
          this.commonService.finished = true;
          this.cf.detectChanges();
        }
      })
    }
    else {
      this.orderService.getVouchersByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, 10, this.voucherID, this.dealHeader, this.voucherHeader, this.voucherStatus, this.invoiceStatus, this.deal, this.voucherheader, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          if(res.data?.totalCount >= this.offset) {
            this.commonService.finished = false;
            this.commonService.optionsLengthIsZero = false;
            this.cf.detectChanges();
            const uniqueArray = this.commonService.getUniqueListBy(res.data.data, 'voucherHeader');
            this.filteredVoucherName = uniqueArray.map((filtered: any) => {
              return {
                id: filtered.id,
                value: filtered.voucherHeader,
                checked: false
              }
            })
            this.filteredVoucherNameSearch.push(...this.filteredVoucherName);
            this.cf.detectChanges();
          }
          else if(res.data?.totalCount <= this.offset) {
            this.commonService.finished = true
          }
        }
        if(res.data.data.length == 0) {
          this.commonService.optionsLengthIsZero = true;
          this.cf.detectChanges();
        }
      })
    }
  }

  sortByTitle(deal: any) {
    this.limit = 7;
    this.deal = deal;
    this.applyFilter();
  }

  sortByVoucherName(voucherheader: any) {
    this.limit = 7;
    this.voucherheader = voucherheader;
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

  filterByDate(dateFrom: number, dateTo: number) {
    this.offset = 0;
    this.fromDate = dateFrom;
    this.toDate = dateTo;
    this.getVouchersByMerchant();
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
    this.appliedFilterID = false;
    this.appliedFilterHeader = false;
    this.appliedFilterVoucherHeader = false;
    this.appliedFilterStatus = false;
    this.appliedFilterPaymentStatus = false;
    this.limit = 7;
    this.voucherIDsFilter = [];
    this.dealHeadersFilters = [];
    this.invoiceStatusesFilters = [];
    this.voucherHeadersFilters = [];
    this.voucherStatusesFilters = [];
    this.filteredVoucherNameSearch = [];
    this.filteredVoucherIDSearch = [];
    this.filteredDealHeaderSearch = [];
    this.voucherID = '';
    this.dealHeader = '';
    this.deal = '';
    this.voucherHeader = '';
    this.voucherStatus = '';
    this.invoiceStatus = '';
    this.getVouchersByMerchant();
    this.filterByVoucherID('');
    this.filterByVoucherHeader('');
    this.filterByDealHeader('');
  }

  next():void {
    this.page;
    this.getVouchersByMerchant();
  }

  async openModal(index: number) {
    this.singleVoucher = this.voucherSearchValues.pipe(map(value => value[index]));
    return await this.modal.open();
  }

  async closeModal() {
    return await this.modal.close();
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
