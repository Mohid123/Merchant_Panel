import { AfterViewInit, ApplicationRef, Component, ComponentFactoryResolver, ComponentRef, Injector, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg, FullCalendarComponent } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
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
  encapsulation: ViewEncapsulation.None
})

export class ViewDealComponent implements OnInit, AfterViewInit {

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
      startDate: "3, April 2022",
      endDate: "16, April 2022",
      showDetail: false,
      available: '500',
      sold: '456',
      status: 'Active',
      average: '4.0'
    },
    {
      title: 'Earthly Massage',
      startDate: "1, April 2022",
      endDate: "6, April 2022",
      showDetail: false,
      available: '768',
      sold: '156',
      status: 'Active',
      average: '3.0'
    },
    {
      title: 'Firey Massage',
      startDate: "22, April 2022",
      endDate: "29, April 2022",
      showDetail: false,
      available: '34',
      sold: '12',
      status: 'Active',
      average: '4.0'
    },
    {
      title: 'Watery Massage',
      startDate: "23, April 2022",
      endDate: "26, April 2022",
      showDetail: false,
      available: '123',
      sold: '45',
      status: 'Active',
      average: '2.0'
    },
    {
      title: 'Airy Massage',
      startDate: "15, April 2022",
      endDate: "19, April 2022",
      showDetail: false,
      available: '65',
      sold: '12',
      status: 'Active',
      average:'1.0'
    },
    {
      title: 'Relaxing Massage',
      startDate: "14, April 2022",
      endDate: "18, April 2022",
      showDetail: false,
      available: '63',
      sold: '61',
      status: 'Active',
      average: '5.0'
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

  currentEvents: EventApi[] = [];

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
    select: this.handleDateSelect.bind(this),
    eventClick: this.showPopover.bind(this),
    // eventsSet: this.handleEvents.bind(this),
    eventDidMount: this.renderTooltip.bind(this),
    eventWillUnmount: this.destroyTooltip.bind(this),
    eventMouseEnter: this.showPopover.bind(this),
    eventMouseLeave: this.hidePopover.bind(this),
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
    private appRef: ApplicationRef
    ) {
  }


  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.fullCalendar.getApi().render();
  }

  something() {
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


  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

  async openNew(event:any) {
    return await this.modal.open();
  }

  async closeModal() {
    return await this.modal.close();
  }

}
