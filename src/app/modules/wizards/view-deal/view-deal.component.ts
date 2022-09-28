import { animate, style, transition, trigger } from '@angular/animations';
import { ApplicationRef, ChangeDetectorRef, Component, ComponentFactoryResolver, Injector, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { DealService } from '@core/services/deal.service';
import { CalendarOptions, DateSelectArg, EventClickArg, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { NgbDate, NgbDropdown, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { CommonFunctionsService } from '@pages/services/common-functions.service';
import * as moment from 'moment';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { Deals, MainDeal } from 'src/app/modules/wizards/models/main-deal.model';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
import { GreaterThanValidator } from '../greater-than.validator';
import { Vouchers } from '../models/vouchers.model';
import { createEventId } from '../steps/step4/event-utils';
import { ModalConfig } from './../../../@core/models/modal.config';
import { ConnectionService } from './../services/connection.service';

// @Component({
//   template: `
//     <div class="fc-content" #popoverHook="ngbPopover" [popoverClass]="'calendar-popover'" [ngbPopover]="template" [placement]="'bottom'" triggers="manual">
//       <ng-content></ng-content>
//     </div>
//   `,
// })
// export class PopoverWrapperComponent {
//   template: TemplateRef<any>;

//   @ViewChild('popoverHook')
//   public popoverHook: NgbPopover
// }

@Component({
  selector: 'app-view-deal',
  templateUrl: './view-deal.component.html',
  styleUrls: ['./view-deal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(-100%)'}),
        animate('225ms ease-in-out', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('325ms ease-in-out', style({transform: 'translateY(-100%)', opacity: '0'}))
      ])
    ])
  ]
})

export class ViewDealComponent implements OnInit, OnDestroy {

  @ViewChild('modal') private modal: ReusableModalComponent;
  @ViewChild('myDrop') myDrop: NgbDropdown

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


  calendarPlugins = [dayGridPlugin];

  showDiv = {
    listView: true,
    calendarView: false
  }

  currentEvents: any;
  filteredResult: any;
  filteredResultID: any[] = [];
  filteredHeader: any;
  filteredHeaderUpdated: any[] = [];
  filteredStatus: any;
  showData: boolean;
  offset: number = 0;
  limit: number = 7;
  hoveredDate: NgbDate | any = null;
  fromDate: NgbDate | any;
  toDate: NgbDate | any = null;
  startDate: string;
  endDate: string;
  title: string = '';
  price: string;
  destroy$ = new Subject();
  status: string;
  page: number;
  searchPage: number;
  dealData: Deals | any;
  selectedIndex: any;
  editVouchers: FormGroup;
  clickInfo: any;
  dealID: string = '';
  dealIDSubject = new BehaviorSubject('');
  header: string = '';
  dealStatus: string = '';
  dealIDsFilters : any;
  dealHeadersFilters: any;
  dealStatusesFilters: any;
  voucherId: string;
  dealIDForEdit: string;
  voucherIndex: any;
  publishStartDate: any;
  publishEndDate: any;
  voucherValidityDate: any;


  statusTypes = [
    {
      id: 0,
      status: 'Draft'
    },
    {
      id: 1,
      status: 'In review'
    },
    {
      id: 2,
      status: 'Scheduled'
    },
    {
      id: 3,
      status: 'Needs attention'
    },
    {
      id: 4,
      status: 'Published'
    },
    {
      id: 5,
      status: 'Expired'
    }
  ];

  appliedFilterID: boolean = false;
  appliedFilterHeader: boolean = false;
  appliedFilterStatus: boolean = false;

  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'today'
    },
    contentHeight: 'auto',
    firstDay: 1,
    initialView: 'dayGridMonth',
    weekends: true,
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: 3,
    // moreLinkClick: 'popover',
    // select: this.handleDateSelect.bind(this),
    // eventClick: this.handleEventClick.bind(this),
    // eventsSet: this.handleEvents.bind(this),
    // eventDidMount: this.renderTooltip.bind(this),
    // eventWillUnmount: this.destroyTooltip.bind(this),
    // eventMouseEnter: this.showPopover.bind(this),
    // eventMouseLeave: this.hidePopover.bind(this),
    /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
  };

  newData : any[] = [];
  @ViewChild('fullCalendar') fullCalendar: FullCalendarComponent;
  @ViewChild('modal2') private modal2: TemplateRef<any>


  constructor(
    private conn: ConnectionService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef,
    private authService: AuthService,
    private dealService: DealService,
    private cf: ChangeDetectorRef,
    private toast: HotToastService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private commonService: CommonFunctionsService,
    private router: Router
  ) {
      this.page = 1
      this.fromDate = '';
      this.toDate = '';
  }


  ngOnInit(): void {
    this.getDealsByMerchantID();
    this.initEditVouchers();
    this.filteredStatus = this.statusTypes.map((filtered: any) => {
      return {
        id: filtered.id,
        value: filtered.status,
        checked: false
      }
    });
    this.filterByDealID('');
    this.filterByDealHeader('');
  }

  initEditVouchers() {
    this.editVouchers = this.fb.group({
      originalPrice: [
        '',
        Validators.compose([
        Validators.required,
        ]),
      ],
      dealPrice: [
        ''
      ],
      numberOfVouchers: [
        '0',
        Validators.compose([
        Validators.required,
        Validators.min(1)
        ])
      ],
      title: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern(`^[a-zA-Z0-9.,"'-:èëéà ]+`)
        ])
      ],
      discountPercentage: [
        0
      ]
      }, {
        validator: GreaterThanValidator('originalPrice', 'dealPrice')
    })
  }

  editHandlePlus() {
    this.editVouchers.patchValue({
      numberOfVouchers: parseInt(this.editVouchers.get('numberOfVouchers')?.value) + 1
    });
  }

  editHandleMinus() {
    if(this.editVouchers.controls['numberOfVouchers'].value >= 1) {
      this.editVouchers.patchValue({
        numberOfVouchers: parseInt(this.editVouchers.get('numberOfVouchers')?.value) - 1
      });
    }
  }

  public trackItem (index: number, item: MainDeal) {
    return item?.id;
  }

  getDealsByMerchantID() {
    this.showData = false;
    const params: any = {}
    this.dealService.getDeals(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.dealID, this.header, this.dealStatus, this.title, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any)=> {
      if (!res.hasErrors()) {
        this.dealData = res.data;
        this.currentEvents = res.data.data.map((data: any) => {
          data.publishDateStart = new Date(data.startDate).setUTCHours(0,0,0,0);
          data.publishDateEnd = new Date(data.endDate).setUTCHours(0,0,0,0);
          data.subDeals.map((subdeal: any) => {
            subdeal.voucherStartDate = new Date(subdeal.voucherStartDate).setUTCHours(0,0,0,0);
            subdeal.voucherEndDate = new Date(subdeal.voucherEndDate).setUTCHours(0,0,0,0);
            if(subdeal.originalPrice.toString().includes('.')) {
              subdeal.originalPrice = subdeal.originalPrice.toString().replace('.', ',');
            }
            else {
              subdeal.originalPrice = subdeal.originalPrice.toFixed(2).replace('.', ',')
            }
            if(subdeal.dealPrice.toString().includes('.')) {
              subdeal.dealPrice = subdeal.dealPrice.toString().replace('.', ',');
            }
            else {
              subdeal.dealPrice = subdeal.dealPrice.toFixed(2).replace('.', ',');
            }
          })
          return data
        });
        console.log(this.currentEvents)
        this.showData = true;
        this.cf.detectChanges();
        this.calendarOptions.events = res.data.data.map((item: MainDeal) => {
          if(item.dealStatus == 'Draft' || item.dealStatus == 'Expired') {
            return {
              title: null,
              start: null,
              end: null,
              backgroundColor: '',
              borderColor: '',
              extendedProps: {}
            }
          }
          if(item.dealStatus == 'In review') {
            return {
              title:item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#F59E0B',
              borderColor: '#F59E0B',
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                subDeals: item.subDeals,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Published') {
            return {
              title:item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#10B981',
              borderColor: '#10B981',
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                subDeals: item.subDeals,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Scheduled') {
            return {
              title:item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#3B82F6',
              borderColor: '#3B82F6',
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                subDeals: item.subDeals,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Needs attention') {
            return {
              title:item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#EF4444',
              borderColor: '#EF4444',
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                subDeals: item.subDeals,
                status: item.dealStatus
              }
            }
          }
        })
      }
    })
  }

  isFilterAppliedOnID(fiilterApplied: any) {
    this.appliedFilterID = fiilterApplied;
  }

  isFilterAppliedOnHeader(fiilterApplied: any) {
    this.appliedFilterHeader = fiilterApplied;
  }

  isFilterAppliedOnStatus(fiilterApplied: any) {
    this.appliedFilterStatus = fiilterApplied;
  }

  deleteDeal(dealID: string) {
    this.dealService.deleteDeal(dealID)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.getDealsByMerchantID();
        this.toast.success('Deal removed')
      }
    })
  }

  duplicateDeal(index: number) {
    this.currentEvents[index].id = '';
    this.currentEvents[index].dealID = '';
    this.currentEvents[index].isCollapsed = false;
    delete this.currentEvents[index].createdAt;
    delete this.currentEvents[index].updatedAt;
    this.currentEvents[index].isDuplicate = true;
    this.dealService.createDeal(this.currentEvents[index]).pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.applyFilters();
        this.toast.success('Deal successfully duplicated', {
          duration: 1000
        })
      }
    })
  }

  async editDeal(index: number) {
    return await this.router.navigate(['/deals/create-deal']).finally(() => {
      switch (this.currentEvents[index]?.dealStatus) {
        case 'Draft':
          this.conn.sendStep1(this.currentEvents[index]);
        break;
        case 'Needs attention':
          this.conn.sendStep1(this.currentEvents[index]);
        break;
        case 'Published':
          this.conn.currentStep$.next(4);
          this.conn.sendSaveAndNext(this.currentEvents[index]);
        break;
        case 'Scheduled':
          this.conn.currentStep$.next(4);
          this.conn.sendSaveAndNext(this.currentEvents[index]);
        break;
      }
    });
  }

  filterByTitle(title: any) {
    this.limit = 7;
    this.title = title;
    this.applyFilters();
  }

  filterByStatus(status: string) {
    this.offset = 0;
    this.status = status;
    this.getDealsByMerchantID();
  }

  filterByDealID(dealID: any) {
    this.offset = 0;
    if(dealID?.value != this.dealID || dealID?.value == '') {
      this.filteredResultID = [];
      this.commonService.optionsLengthIsZero = false;
    }
    this.dealID = dealID?.value ? dealID?.value : '';
    this.searchPage = dealID?.page ? dealID?.page:  1;
    const params: any = {};
    if(this.dealID == '') {
      this.dealService.getDeals(this.searchPage, this.authService.currentUserValue?.id, this.offset, 10, this.dealID, '', '', this.title, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.commonService.optionsLengthIsZero = false;
          this.cf.detectChanges();
          this.filteredResult = res.data.data.map((filtered: MainDeal) => {
            return {
              id: filtered.id,
              value: filtered.dealID,
              checked: false
            }
          })
          this.filteredResultID.push(...this.filteredResult);
          this.cf.detectChanges();
          this.commonService.finished = true;
          this.cf.detectChanges();

        }
      })
    }
    else {
      this.dealService.getDeals(this.searchPage, this.authService.currentUserValue?.id, this.offset, 10, this.dealID, '', '', this.title, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          if(res.data?.totalDeals >= this.offset) {
            this.commonService.optionsLengthIsZero = false;
            this.commonService.finished = false;
            this.cf.detectChanges();
            this.filteredResult = res.data.data.map((filtered: MainDeal) => {
              return {
                id: filtered.id,
                value: filtered.dealID,
                checked: false
              }
            })
            this.filteredResultID.push(...this.filteredResult);
            this.cf.detectChanges();

          }
          else if(res.data?.totalDeals <= this.offset) {
            this.commonService.finished = true;
          }
        }
        if(res.data.data.length == 0) {
          this.commonService.optionsLengthIsZero = true;
          this.cf.detectChanges();
        }
      })
    }
  }

  filterByDealHeader(header: any) {
    if(header?.value != this.header || header?.value == '') {
      this.filteredHeaderUpdated = [];
      this.commonService.optionsLengthIsZero = false;
      this.offset = 0;
    }
    this.header = header?.value ? header?.value : '';
    this.searchPage = header.page ? header.page : 1;
    const params: any = {};
    if(this.header == '') {
      this.dealService.getDeals(this.searchPage, this.authService.currentUserValue?.id, this.offset, 10, '', this.header, '', this.title, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.commonService.optionsLengthIsZero = false;
          const uniqueArray = this.commonService.getUniqueListBy(res.data.data, 'dealHeader')
          this.filteredHeader = uniqueArray.map((filtered: any) => {
            return {
              id: filtered.id,
              value: filtered.dealHeader,
              checked: false
            }
          })
          this.filteredHeaderUpdated.push(...this.filteredHeader);
          this.commonService.finished = true;
          this.cf.detectChanges();
        }
      })
    }
    else {
      this.dealService.getDeals(this.searchPage, this.authService.currentUserValue?.id, this.offset, 10, '', this.header, '', this.title, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          if(res.data?.totalDeals >= this.offset) {
            this.commonService.finished = false;
            this.commonService.optionsLengthIsZero = false;
            const uniqueArray = this.commonService.getUniqueListBy(res.data.data, 'dealHeader')
            this.filteredHeader = uniqueArray.map((filtered: any) => {
              return {
                id: filtered.id,
                value: filtered.dealHeader,
                checked: false
              }
            })
            this.filteredHeaderUpdated.push(...this.filteredHeader);
            this.cf.detectChanges();
          }
          else if(res.data?.totalDeals <= this.offset) {
            this.commonService.finished = true
          }
        }
        if(res.data.data.length == 0) {
          this.commonService.optionsLengthIsZero = true;
          this.cf.detectChanges();
        }
      })
    }

    // }
    // else {
    //   this.filteredHeaderUpdated.length = 0;
    //   this.commonService.optionsLengthIsZero = true;
    //   this.cf.detectChanges();
    // }
  }

  filterSelectedDealByID(options: any) {
    this.showData = false;
    this.dealIDsFilters = options;
    this.page = 1;
    this.applyFilters();
  }

  filterSelectedDealByHeader(options: any) {
    this.showData = false;
    this.dealHeadersFilters = options;
    this.page = 1;
    this.applyFilters();
  }

  filterSelectedDealByStatus(options: any) {
    this.showData = false;
    this.dealStatusesFilters = options;
    this.page = 1;
    this.applyFilters();
  }

  applyFilters(){
    this.showData = false;
    const params: any = {
      dealIDsArray: this.dealIDsFilters?.filterData ? this.dealIDsFilters?.filterData : [],
      dealHeaderArray: this.dealHeadersFilters?.filterData ? this.dealHeadersFilters?.filterData : [],
      dealStatusArray: this.dealStatusesFilters?.filterData ? this.dealStatusesFilters?.filterData : []
    }
    this.dealService.getDeals(this.page, this.authService.currentUserValue?.id, 0, this.limit, '', '', '', this.title, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (!res.hasErrors()) {
        this.dealData = res.data;
        this.currentEvents = res.data.data;
        this.showData = true;
        this.cf.detectChanges();
        this.calendarOptions.events = res.data.data.map((item: MainDeal) => {
          if(item.dealStatus == 'Draft' || item.dealStatus == 'Expired') {
            return {
              title: null,
              start: null,
              end: null,
              backgroundColor: '',
              borderColor: '',
              extendedProps: {}
            }
          }
          if(item.dealStatus == 'In review') {
            return {
              title:item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#F59E0B',
              borderColor: '#F59E0B',
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                subDeals: item.subDeals,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Published') {
            return {
              title:item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#10B981',
              borderColor: '#10B981',
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                subDeals: item.subDeals,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Scheduled') {
            return {
              title:item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#3B82F6',
              borderColor: '#3B82F6',
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                subDeals: item.subDeals,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Needs attention') {
            return {
              title:item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#EF4444',
              borderColor: '#EF4444',
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                subDeals: item.subDeals,
                status: item.dealStatus
              }
            }
          }
        })
      }
    })
  }

  sendPaginationNext(){
    this.showData = false;
    const params: any = {
      dealIDsArray: this.dealIDsFilters?.filterData ? this.dealIDsFilters?.filterData : [],
      dealHeaderArray: this.dealHeadersFilters?.filterData ? this.dealHeadersFilters?.filterData : [],
      dealStatusArray: this.dealStatusesFilters?.filterData ? this.dealStatusesFilters?.filterData : []
    }
    this.dealService.getDeals(this.page, this.authService.currentUserValue?.id, 0, this.limit, '', '', '', this.title, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (!res.hasErrors()) {
        this.dealData = res.data;
        this.currentEvents = res.data.data;
        this.showData = true;
        this.cf.detectChanges();
        this.calendarOptions.events = res.data.data.map((item: MainDeal) => {
          if(item.dealStatus == 'Draft' || item.dealStatus == 'Expired') {
            return {
              title: null,
              start: null,
              end: null,
              backgroundColor: '',
              borderColor: '',
              extendedProps: {}
            }
          }
          if(item.dealStatus == 'In review') {
            return {
              title:item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#F59E0B',
              borderColor: '#F59E0B',
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                subDeals: item.subDeals,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Published') {
            return {
              title:item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#10B981',
              borderColor: '#10B981',
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                subDeals: item.subDeals,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Scheduled') {
            return {
              title:item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#3B82F6',
              borderColor: '#3B82F6',
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                subDeals: item.subDeals,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Needs attention') {
            return {
              title:item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#EF4444',
              borderColor: '#EF4444',
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                subDeals: item.subDeals,
                status: item.dealStatus
              }
            }
          }
        })
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

  ngAfterViewInit() {
    this.fullCalendar.getApi().render();
  }

  switchTabs(event:any) {
    if (event.index == 0) {
      this.showDiv.listView = true;
      this.showDiv.calendarView = false;

    } else  {
      this.showDiv.listView = false;
      this.showDiv.calendarView = true;

    }
  }

  something() {
    this.fullCalendar.getApi().render();
  }

  next():void {
    this.page;
    this.sendPaginationNext();
  }

  handleWeekendsToggle() {
    const { calendarOptions } = this;
    calendarOptions.weekends = !calendarOptions.weekends;
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const title = "Event Title"
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      });
    }
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.clickInfo = clickInfo.event;
    return this.modalService.open(this.modal2, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      modalDialogClass: 'modal-xl'
    });
  }


  handleEvents(events:any) {
    this.currentEvents = events;
  }

  async openNew(index: any, editIndex: any) {
    this.selectedIndex = index;
    this.voucherIndex = editIndex;
    this.dealIDForEdit = this.currentEvents[index].id;
    this.voucherId = this.currentEvents[index].subDeals[editIndex]?._id;
    this.editVouchers.patchValue({
      originalPrice: this.currentEvents[index].subDeals[editIndex]?.originalPrice,
      dealPrice: this.currentEvents[index].subDeals[editIndex]?.dealPrice,
      numberOfVouchers: this.currentEvents[index].subDeals[editIndex]?.numberOfVouchers,
      title: this.currentEvents[index].subDeals[editIndex]?.title
      })
    if(this.currentEvents[index]?.dealStatus == 'Published') {
      this.editVouchers.get('originalPrice')?.disable();
      this.editVouchers.get('dealPrice')?.disable();
      this.editVouchers.get('title')?.disable();
    }
    else {
      this.editVouchers.get('originalPrice')?.enable();
      this.editVouchers.get('dealPrice')?.enable();
      this.editVouchers.get('title')?.enable();
      this.editVouchers.get('numberOfVouchers')?.enable();
    }
    return await this.modal.open();
  }

  saveEditVoucherOnListView() {
    const voucher: Vouchers = {
      voucherID: this.voucherId,
      title: this.editVouchers.get('title')?.value,
      originalPrice: this.editVouchers.get('originalPrice')?.value,
      dealPrice: this.editVouchers.get('dealPrice')?.value,
      numberOfVouchers: parseInt(this.editVouchers.get('numberOfVouchers')?.value)
    }
    this.dealService.updateVoucher(this.dealIDForEdit, {subDeals: voucher})
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.toast.success('Sub deal updated!');
        this.modal.close().then(() => {
          this.getDealsByMerchantID();
        });
      }
      else {
        this.toast.error(res.errors[0].error.message);
        this.modal.close();
      }
    })
  }

  async openCalendarNew(index: any) {
    this.editVouchers.patchValue(this.clickInfo._def.extendedProps.subDeals[index]);
    return await this.modal.open();
  }

  async closeModal() {
    this.editVouchers.reset();
    return await this.modal.close();
  }

  async closeModal2() {
    return this.modalService.dismissAll();
  }

  resetFilters() {
    this.limit = 7;
    this.appliedFilterID = false;
    this.appliedFilterHeader = false;
    this.appliedFilterStatus = false;
    this.filteredHeaderUpdated = [];
    this.filteredResultID = [];
    this.dealIDsFilters = [];
    this.dealHeadersFilters = [];
    this.dealStatusesFilters = [];
    this.filteredStatus.forEach((val: any) => val.checked = false);
    this.header = '';
    this.dealID = '';
    this.searchPage = 1;
    this.page = 1;
    this.applyFilters();
    this.filterByDealID('');
    this.filterByDealHeader('');
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }


}
