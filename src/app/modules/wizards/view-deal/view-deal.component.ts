import { animate, state, style, transition, trigger } from '@angular/animations';
import { ApplicationRef, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, Injector, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { DealService } from '@core/services/deal.service';
import { CalendarOptions, DateSelectArg, EventClickArg, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { NgbDate, NgbDropdown, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { Deals, MainDeal } from 'src/app/modules/wizards/models/main-deal.model';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
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
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  encapsulation: ViewEncapsulation.None
})

export class ViewDealComponent implements OnInit {

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
    moreLinkClick: 'popover',
    // select: this.handleDateSelect.bind(this),
    // eventClick: this.showPopover.bind(this),
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
  @ViewChild('fullCalendar') fullCalendar: FullCalendarComponent


  constructor(
    private conn: ConnectionService,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private appRef: ApplicationRef,
    private authService: AuthService,
    private dealService: DealService,
    private cf: ChangeDetectorRef
  ) {
      this.page = 1
      this.fromDate = '';
      this.toDate = '';
  }


  ngOnInit(): void {
    this.authService.retreiveUserValue();
    this.getDealsByMerchantID();
  }

  getDealsByMerchantID() {
    debugger
    this.showData = false;
    const params: any = {
      title: this.title,
      status: this.status,
      startDate: this.startDate,
      endDate: this.endDate,
      dateFrom: new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day).getTime(),
      dateTo: new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day).getTime()
    }
    this.dealService.getDeals(this.page, this.authService.merchantID, this.offset, this.limit, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any)=> {
      debugger
      if (!res.hasErrors()) {
        debugger
        this.dealData = res.data;
        this.currentEvents = res.data.data;
        this.showData = true;
        this.cf.detectChanges();
        this.calendarOptions.events = res.data.data.map((item:MainDeal) => {
          if(item.dealStatus == 'In Review') {
            return {
              title:item.title,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#F59E0B',
              borderColor: '#F59E0B'
            }
          }
          if(item.dealStatus == 'Published') {
            return {
              title:item.title,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD')
            }
          }
          if(item.dealStatus == 'Scheduled') {
            return {
              title:item.title,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#10B981',
              borderColor: '#10B981'
            }
          }
          if(item.dealStatus == 'Bounced') {
            return {
              title:item.title,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
              backgroundColor: '#EF4444',
              borderColor: '#EF4444'
            }
          }
        })
      }
    })
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
    debugger
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
    this.page++;
    this.getDealsByMerchantID();
  }

  previous():void {
    this.page--;
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
    // if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
    //   clickInfo.event.remove();
    // }
    console.log('clickInfo:',clickInfo);
    // this.openPopover(clickInfo);
    this.showPopover(clickInfo)

  }


  handleEvents(events:any) {
    this.currentEvents = events;
  }

  async openNew(event:any) {
    return await this.modal.open();
  }

  async closeModal() {
    return await this.modal.close();
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

  // if(item.dealStatus == 'In Review') {
  //   return {
  //     title:item.title,
  //     start: moment(item.startDate).format('YYYY-MM-DD'),
  //     end: moment(item.endDate).format('YYYY-MM-DD'),
  //     backgroundColor: '#F59E0B',
  //     borderColor: '#F59E0B'
  //   }
  // })
  // }
  // if(item.dealStatus == 'Published') {
  //   return {
  //     title:item.title,
  //     start: moment(item.startDate).format('YYYY-MM-DD'),
  //     end: moment(item.endDate).format('YYYY-MM-DD'),
  //   }
  // }
  // if(item.dealStatus == 'Scheduled') {
  //   return {
  //     title:item.title,
  //     start: moment(item.startDate).format('YYYY-MM-DD'),
  //     end: moment(item.endDate).format('YYYY-MM-DD'),
  //     backgroundColor: '#10B981',
  //     borderColor: '#10B981'
  //   }
  // }
  // if(item.dealStatus == 'Bounced') {
  //   return {
  //     title:item.title,
  //     start: moment(item.startDate).format('YYYY-MM-DD'),
  //     end: moment(item.endDate).format('YYYY-MM-DD'),
  //     backgroundColor: '#EF4444',
  //     borderColor: '#EF4444'
  //   }
  // }


}
