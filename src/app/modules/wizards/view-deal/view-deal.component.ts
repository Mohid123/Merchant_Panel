import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { DealService } from '@core/services/deal.service';
import { CalendarOptions, DateSelectArg, EventClickArg, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { NgbDate, NgbDropdown, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import * as moment from 'momnet';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { Deals, MainDeal } from 'src/app/modules/wizards/models/main-deal.model';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
import { GreaterThanValidator } from '../greater-than.validator';
import { createEventId } from '../steps/step4/event-utils';
import { ModalConfig } from './../../../@core/models/modal.config';
import { ConnectionService } from './../services/connection.service';



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
  @ViewChild('myDrop') myDrop: NgbDropdown;
  public isCollapsed: boolean[] = [true];
  editVouchers: FormGroup;

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
  showData: boolean;
  offset: number = 0;
  limit: number = 7;
  hoveredDate: NgbDate | any = null;
  fromDate: NgbDate | any;
  toDate: NgbDate | any = null;
  startDate: string;
  endDate: string;
  title: string;
  price: string;
  destroy$ = new Subject();
  status: string;
  page: number;
  dealData: Deals | any;
  paginator: any[] = [];
  selectedIndex: any;

  statusTypes = [
    {
      status: 'Published'
    },
    {
      status: 'Scheduled'
    },
    {
      status: 'In Review'
    },
    {
      status: 'Bounced'
    }
  ];

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
    eventClick: this.handleEventClick.bind(this),
  };

  newData : any[] = [];
  subDeals: any[] = [];
  clickInfo: any;

  @ViewChild('fullCalendar') fullCalendar: FullCalendarComponent;
  @ViewChild('modal2') private modal2: TemplateRef<any>


  constructor(
    private conn: ConnectionService,
    private fb: FormBuilder,
    private authService: AuthService,
    private dealService: DealService,
    private cf: ChangeDetectorRef,
    private toast: HotToastService,
    private router: Router,
    private modalService: NgbModal
  ) {
      this.page = 1
      this.fromDate = '';
      this.toDate = '';
  }


  ngOnInit(): void {
    this.getDealsByMerchantID();
    this.initEditVouchers();
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

  editVoucher() {
    if(this.editVouchers.invalid) {
      this.editVouchers.markAllAsTouched();
      return;
    }
    if(parseInt(this.editVouchers.controls['dealPrice']?.value) >= 0) {
      const dealPrice = Math.round(parseInt(this.editVouchers.controls['originalPrice']?.value) - parseInt(this.editVouchers.controls['dealPrice']?.value));
      const discountPrice = Math.floor(100 * dealPrice/parseInt(this.editVouchers.controls['originalPrice']?.value));
      this.editVouchers.controls['discountPercentage']?.setValue(discountPrice);
    }
    else if(!parseInt(this.editVouchers.controls['dealPrice']?.value)) {
      const discountPrice = 100;
      this.editVouchers.controls['discountPercentage']?.setValue(discountPrice);
    }
    else {
      this.editVouchers.controls['dealPrice']?.setValue('0');
      const dealPrice = Math.round(parseInt(this.editVouchers.controls['originalPrice']?.value) - parseInt(this.editVouchers.controls['dealPrice']?.value));
      const discountPrice = Math.floor(100 * dealPrice/parseInt(this.editVouchers.controls['originalPrice']?.value));
      this.editVouchers.controls['discountPercentage']?.setValue(discountPrice);
    }
    // this.dealService.createDeal(this.editVouchers.value).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {

    // })
    this.closeModal();
    this.editVouchers.reset();
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
    const params: any = {
      title: this.title,
      status: this.status,
      startDate: this.startDate,
      endDate: this.endDate,
      dateFrom: new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day).getTime(),
      dateTo: new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day).getTime()
    }
    this.dealService.getDeals(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any)=> {
      if (!res.hasErrors()) {
        this.dealData = res.data;
        this.currentEvents = res.data.data;
        this.showData = true;
        this.cf.detectChanges();
        this.calendarOptions.events = res.data.data.map((item: MainDeal) => {
          if(item.dealStatus == 'InComplete') {
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
          if(item.dealStatus == 'Bounced') {
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

  deleteDeal(dealID: string) {
    this.dealService.deleteDeal(dealID)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.conn.sendSaveAndNext({});
        this.getDealsByMerchantID();
        this.toast.success('Deal removed')
      }
    })
  }

  getDraft(dealID: string, pageNumber: number) {
    if(dealID && pageNumber) {
      this.conn.currentStep$.next(pageNumber);
      this.dealService.getDealByID(dealID).pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.conn.sendSaveAndNext(res.data);
          this.router.navigate(['/deals/create-deal']);
        }
      })
    }
  }

  filterByStartDate(startDate: string) {
    this.offset = 0;
    if(this.startDate == '' || this.startDate == 'Descending') {
      this.startDate = 'Ascending'
    }
    else {
      this.startDate = startDate;
    }
    this.getDealsByMerchantID();
  }

  filterByTitle(title: string) {
    this.offset = 0;
    if(this.title == '' || this.title == 'Descending') {
      this.title = 'Ascending'
    }
    else {
      this.title = title;
    }
    this.getDealsByMerchantID();
  }

  filterByDate(startDate: number, endDate: number) {
    this.offset = 0;
    this.fromDate = startDate;
    this.toDate = endDate;
    this.getDealsByMerchantID();
  }

  filterByEndDate(endDate: string) {
    this.offset = 0;
    if(this.endDate == '' || this.endDate == 'Descending') {
      this.endDate = 'Ascending'
    }
    else {
      this.endDate = endDate;
    }
    this.getDealsByMerchantID();
  }

  filterByPrice(price: string) {
    this.offset = 0;
    if(this.price == '' || this.price == 'Descending') {
      this.price = 'Ascending'
    }
    else {
      this.price = price;
    }
    this.getDealsByMerchantID();
  }

  filterByStatus(status: string) {
    this.offset = 0;
    this.status = status;
    this.getDealsByMerchantID();
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
    this.getDealsByMerchantID();
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

  async openNew(index: any, editIndex: any) {
    this.selectedIndex = index;
    this.editVouchers.patchValue(this.currentEvents[index].vouchers[editIndex])
    return await this.modal.open();
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
    this.offset = 0;
    this.fromDate = '';
    this.toDate = '';
    this.title = 'Ascending';
    this.startDate = 'Ascending';
    this.endDate = 'Ascending';
    this.price = 'Ascending';
    this.status = '';
    this.getDealsByMerchantID();
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }


}
