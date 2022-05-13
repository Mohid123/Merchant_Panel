import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MediaService } from '@core/services/media.service';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/angular';
import * as moment from 'moment';
import { combineLatest, of, Subscription } from 'rxjs';
import { exhaustMap, take } from 'rxjs/operators';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
import { MainDeal } from '../../models/main-deal.model';
import { ModalConfig } from './../../../../@core/models/modal.config';
import { DealService } from './../../../../@core/services/deal.service';
import { ConnectionService } from './../../services/connection.service';
import { createEventId } from './event-utils';

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
})
export class Step4Component implements OnInit {

  @Input() images: Array<any>;
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


  currentEvents: EventApi[] = [];
  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    height: "auto",
    initialView: 'dayGridMonth',
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    firstDay: 1,
    validRange: {
      start: moment().format('YYYY-MM-DD')
    },
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this)
    /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
  };
  @Input('updateParentModel') updateParentModel: (
    part: Partial<MainDeal>,
    isFormValid: boolean
  ) => void;
  form: FormGroup;
  @Input() deal: Partial<MainDeal>;

  reciever: Subscription;
  data: MainDeal;

  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private connection: ConnectionService,
    private dealService: DealService,
    private mediaService: MediaService,
    private router: Router
  ) {
    this.reciever = this.connection.getData().subscribe((response: MainDeal) => {
      this.data = response
      console.log(this.data);
    })
  }

  ngOnInit() {
    this.updateParentModel({}, true);
  }

  handleWeekendsToggle() {
    const { calendarOptions } = this;
    calendarOptions.weekends = !calendarOptions.weekends;
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    // console.log('moment().isSame(selectInfo.startStr):',moment().isSame(selectInfo.startStr,'day'));
    // if(!moment().isSame(selectInfo.startStr,'day') && moment().isAfter(selectInfo.startStr)) { return }

    const title = "Event Title"
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title && !calendarApi.getEvents().length) {
      this.data.startDate = selectInfo.startStr;
      this.data.endDate = selectInfo.endStr;
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
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove();
      this.data.startDate = '';
      this.data.endDate = '';
    }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }
  openNew() {
    debugger
    const mediaUpload:any = [];
    if(!!this.images.length) {
      // console.log('have images:',);
      for (let index = 0; index < this.images.length; index++) {
        mediaUpload.push(this.mediaService.uploadMedia('deal', this.images[index]));
      }
    }
    debugger

    this.data.mediaUrl = [];
    debugger
    combineLatest(mediaUpload)
        .pipe(
          take(1),
          exhaustMap((mainResponse:any) => {
            debugger
            mainResponse.forEach((res:any)=> {
              debugger
              if (!res.hasErrors()) {
                // console.log('res:',res);
                this.data.mediaUrl?.push(res.data.url);
                debugger
              } else {
                return of(null);
              }
            })
            return this.dealService.createDeal(this.data);
          }),
        ).subscribe(async (res) => {
          debugger
        if(!res.hasErrors()) {
          return await this.modal.open();
        }
    })
  }

  async closeModal() {
    return await this.modal.close().then(() => {
      this.router.navigate(['/crafted/pages/wizards/view-deal'])
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.reciever.unsubscribe();
  }
}
