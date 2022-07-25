import { animate, style, transition, trigger } from '@angular/animations';
import { ApplicationRef, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, Injector, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { DealService } from '@core/services/deal.service';
import { CalendarOptions, DateSelectArg, EventClickArg, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { NgbDate, NgbDropdown, NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { CommonFunctionsService } from '@pages/services/common-functions.service';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { Deals, MainDeal } from 'src/app/modules/wizards/models/main-deal.model';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
import { GreaterThanValidator } from '../greater-than.validator';
import { Vouchers } from '../models/vouchers.model';
import { createEventId } from '../steps/step4/event-utils';
import { ModalConfig } from './../../../@core/models/modal.config';
import { ConnectionService } from './../services/connection.service';

@Component({
  template: `
    <div class="fc-content" #popoverHook="ngbPopover" [popoverClass]="'calendar-popover'" [ngbPopover]="template" [placement]="'bottom'" triggers="manual">
      <ng-content></ng-content>
    </div>
  `,
})
export class PopoverWrapperComponent {
  template: TemplateRef<any>;

  @ViewChild('popoverHook')
  public popoverHook: NgbPopover
}

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

  @ViewChild('popContent', { static: true }) popContent: TemplateRef<any>;

  popoversMap = new Map<any, ComponentRef<PopoverWrapperComponent>>();

  popoverFactory = this.resolver.resolveComponentFactory(PopoverWrapperComponent);

  showDiv = {
    listView: true,
    calendarView: false
  }

  currentEvents: any;
  filteredResult: any;
  filteredHeader: any;
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
  dealData: Deals | any;
  selectedIndex: any;
  editVouchers: FormGroup;
  clickInfo: any;
  dealID: string = '';
  header: string = '';
  dealStatus: string = '';
  dealIDsFilters : any;
  dealHeadersFilters: any;
  dealStatusesFilters: any;
  voucherId: string;
  dealIDForEdit: string;
  voucherIndex: any;


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
      status: 'Needs Attention'
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
    eventClick: this.handleEventClick.bind(this),
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
      subTitle: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9 ]+')
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

  getDealsByMerchantID() {
    this.showData = false;
    const params: any = {}
    this.dealService.getDeals(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.dealID, this.header, this.dealStatus, this.title, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any)=> {
      if (!res.hasErrors()) {
        this.dealData = res.data;
        this.currentEvents = res.data.data;
        console.log(this.currentEvents)
        this.showData = true;
        this.cf.detectChanges();
        this.calendarOptions.events = res.data.data.map((item: MainDeal) => {
          if(item.dealStatus == 'Draft') {
            return {
              title: item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#00FF00',
              borderColor: '#00FF00',
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                vouchers: item.vouchers,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'In Review') {
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
                vouchers: item.vouchers,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Published') {
            return {
              title:item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                vouchers: item.vouchers,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Scheduled') {
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
                vouchers: item.vouchers,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Needs Attention') {
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
                vouchers: item.vouchers,
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

//  async editDeal(index: number) {
//     this.conn.sendEditDealData(this.currentEvents[index]);
//     await this.router.navigate(['/deals/create-deal']);
//   }

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

  filterByDealID(dealID: string) {
    this.offset = 0;
    this.dealID = dealID;
    const params: any = {}
    if(this.dealID != '') {
      this.dealService.getDeals(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.dealID, this.header, this.dealStatus, this.title, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
        this.cf.detectChanges();
        this.filteredResult = res.data.data.map((filtered: MainDeal) => {
          return {
            id: filtered.id,
            value: filtered.dealID,
            checked: false
          }
        })
        this.cf.detectChanges();
        }
      })
    }
    else {
      this.filteredResult.length = 0;
    }
  }

  filterByDealHeader(header: string) {
    this.offset = 0;
    this.header = header;
    const params: any = {};
    if(this.header != '') {
      this.dealService.getDeals(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.dealID, this.header, this.dealStatus, this.title, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
        this.cf.detectChanges();
        const uniqueArray = this.commonService.getUniqueListBy(res.data.data, 'dealHeader')
        this.filteredHeader = uniqueArray.map((filtered: any) => {
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
      this.filteredHeader.length = 0;
    }
  }

  filterSelectedDealByID(options: any) {
    this.showData = false;
    this.dealIDsFilters = options;
    this.applyFilters();
  }

  filterSelectedDealByHeader(options: any) {
    this.showData = false;
    this.dealHeadersFilters = options;
    this.applyFilters();
  }

  filterSelectedDealByStatus(options: any) {
    this.showData = false;
    this.dealStatusesFilters = options;
    this.applyFilters();
  }

  applyFilters(){
    this.showData = false;
    const params: any = {
      dealIDsArray: this.dealIDsFilters?.filterData ? this.dealIDsFilters?.filterData : [],
      dealHeaderArray: this.dealHeadersFilters?.filterData ? this.dealHeadersFilters?.filterData : [],
      dealStatusArray: this.dealStatusesFilters?.filterData ? this.dealStatusesFilters?.filterData : []
    }
    this.dealService.getDeals(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, '', '', '', this.title, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if (!res.hasErrors()) {
        this.dealData = res.data;
        this.currentEvents = res.data.data;
        this.showData = true;
        this.cf.detectChanges();
        this.calendarOptions.events = res.data.data.map((item: MainDeal) => {
          if(item.dealStatus == 'Draft') {
            return {
              title: item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#00FF00',
              borderColor: '#00FF00',
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                vouchers: item.vouchers,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'In Review') {
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
                vouchers: item.vouchers,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Published') {
            return {
              title:item.dealHeader,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              extendedProps: {
                dealID: item.dealID,
                sold: item.soldVouchers,
                available: item.pageNumber,
                value: item.pageNumber,
                totalSold: item.pageNumber,
                netEarnings: item.pageNumber,
                img: item.mediaUrl[0],
                vouchers: item.vouchers,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Scheduled') {
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
                vouchers: item.vouchers,
                status: item.dealStatus
              }
            }
          }
          if(item.dealStatus == 'Needs Attention') {
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
                vouchers: item.vouchers,
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


  renderTooltip(event:any) {
    console.log('renderTooltip:',event);
    const projectableNodes = Array.from(event.el.childNodes)

    const compRef = this.popoverFactory.create(this.injector, [projectableNodes], event.el);
    compRef.instance.template = this.popContent;

    this.appRef.attachView(compRef.hostView)
    this.popoversMap.set(event.el, compRef)
  }

  destroyTooltip(event:any) {
    console.log('destroyTooltip:',event);

    const popover = this.popoversMap.get(event.el);
    if (popover) {
      this.appRef.detachView(popover.hostView);
      popover.destroy();
      this.popoversMap.delete(event.el);
    }
  }

  showPopover(event:any) {
    console.log('showPopover:',event);
    const popover = this.popoversMap.get(event.el);
    console.log('popover:',popover);
    if (popover) {
      popover.instance.popoverHook.open({ event: event.event });
    }
  }

  hidePopover(event:any) {
    console.log('hidePopover:',event);
    const popover = this.popoversMap.get(event.el);
    if (popover?.instance?.popoverHook) {
      popover.instance.popoverHook.close();
    }
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
    this.applyFilters();
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
    // console.log('dealID: ', this.dealIDForEdit)
    this.voucherId = this.currentEvents[index].vouchers[editIndex]?._id;
    // console.log('voucherID: ', this.voucherId);
    this.editVouchers.patchValue(this.currentEvents[index].vouchers[editIndex])
    return await this.modal.open();
  }

  saveEditVoucherOnListView() {
    const voucher: Vouchers = {
      voucherID: this.voucherId,
      subTitle: this.editVouchers.get('subTitle')?.value,
      originalPrice: this.editVouchers.get('originalPrice')?.value,
      dealPrice: this.editVouchers.get('dealPrice')?.value,
      numberOfVouchers: this.editVouchers.get('numberOfVouchers')?.value
    }
    this.dealService.updateVoucher(this.dealIDForEdit, {vouchers: voucher})
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.toast.success('Voucher updated!');
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
    this.editVouchers.patchValue(this.clickInfo._def.extendedProps.vouchers[index]);
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
    this.filteredHeader = [];
    this.filteredResult = [];
    this.dealIDsFilters = [];
    this.dealHeadersFilters = [];
    this.dealStatusesFilters = [];
    this.title = '';
    this.applyFilters();
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }


}
