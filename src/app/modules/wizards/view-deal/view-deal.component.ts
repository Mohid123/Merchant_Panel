import { animate, state, style, transition, trigger } from '@angular/animations';
import { ApplicationRef, Component, ComponentFactoryResolver, ComponentRef, Injector, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { DealService } from '@core/services/deal.service';
import { CalendarOptions, DateSelectArg, EventClickArg, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { AuthService } from 'src/app/modules/auth';
import { MainDeal } from 'src/app/modules/wizards/models/main-deal.model';
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

  rows = [
    {
      title: 'Heavenly Massage',
      startDate: "23, April 2022",
      endDate: "26, April 2022",
      showDetail: false,
      available: 768,
      sold: 456,
      status: 'Active'
    },
    {
      title: 'Heavenly Massage',
      startDate: "23, April 2022",
      endDate: "26, April 2022",
      showDetail: false,
      available: 768,
      sold: 456,
      status: 'Active'
    },
    {
      title: 'Heavenly Massage',
      startDate: "23, April 2022",
      endDate: "26, April 2022",
      showDetail: false,
      available: 768,
      sold: 456,
      status: 'Active'
    },
    {
      title: 'Heavenly Massage',
      startDate: "23, April 2022",
      endDate: "26, April 2022",
      showDetail: false,
      available: 768,
      sold: 456,
      status: 'Active'
    },
    {
      title: 'Heavenly Massage',
      startDate: "23, April 2022",
      endDate: "26, April 2022",
      showDetail: false,
      available: 768,
      sold: 456,
      status: 'Active'
    },
    {
      title: 'Heavenly Massage',
      startDate: "23, April 2022",
      endDate: "26, April 2022",
      showDetail: false,
      available: 768,
      sold: 456,
      status: 'Active'
    },
  ]

  calendarPlugins = [dayGridPlugin];

  @ViewChild('popContent', { static: true }) popContent: TemplateRef<any>;

  popoversMap = new Map<any, ComponentRef<PopoverWrapperComponent>>();

  popoverFactory = this.resolver.resolveComponentFactory(PopoverWrapperComponent);

  showDiv = {
    listView: true,
    calendarView: false
  }

  currentEvents: any;

  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'today'
    },
    contentHeight: 'auto',
    initialView: 'dayGridMonth',
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    moreLinkClick: 'popover',
    // select: this.handleDateSelect.bind(this),
    eventClick: this.showPopover.bind(this),
    // eventsSet: this.handleEvents.bind(this),
    eventDidMount: this.renderTooltip.bind(this),
    eventWillUnmount: this.destroyTooltip.bind(this),
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
  ) {
  }


  ngOnInit(): void {
    this.dealService.getDeals(this.authService.currentUserValue?.id).subscribe((res:any)=> {
      if (!res.hasErrors()) {
        debugger
        this.currentEvents = res.data.data;
        this.calendarOptions.events = res.data.data.map((item:MainDeal) => {
            return {
              title:item.title,
              start: moment(item.startDate).format('YYYY-MM-DD'),
              end: moment(item.endDate).format('YYYY-MM-DD'),
            }
          })
      }
    })
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

}
