import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/angular';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { createEventId } from '../steps/step4/event-utils';

@Component({
  selector: 'app-view-deal',
  templateUrl: './view-deal.component.html',
  styleUrls: ['./view-deal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ViewDealComponent implements OnInit {

  @ViewChild('popoverHook')
  public popoverHook: NgbPopover

  showDiv = {
    listView: false,
    calendarView: true
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
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this)
    /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
  };

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  openVerticallyCentered(content: any) {
    this.modalService.open(content, { centered: true });
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
    this.openPopover();

  }

  openPopover() {
    this.popoverHook.open();
    this.popoverHook.placement = 'bottom';
  }

  closePopover() {
    this.popoverHook.close();
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

}
