import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MediaService } from '@core/services/media.service';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/angular';
import { HotToastService } from '@ngneat/hot-toast';
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
  uploaded: boolean;

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
    // height: "auto",
    initialView: 'dayGridMonth',
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: 3,
    firstDay: 1,
    height: 'auto',
    validRange: {
      start: moment().format('YYYY-MM-DD')
    },
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this)
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
    private connection: ConnectionService,
    private dealService: DealService,
    private mediaService: MediaService,
    private router: Router,
    private cf: ChangeDetectorRef,
    private toast: HotToastService
  ) {
    this.reciever = this.connection.getData().subscribe((response: MainDeal) => {
      this.data = response
    })
    this.uploaded = true;
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

    const title = this.data.dealHeader
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
    this.cf.detectChanges();
  }

  openNew() {
    if(this.currentEvents.length == 0) {
      this.toast.warning('Please set a date for the deal!', {
        style: {
          border: '1px solid #F59E0B',
          padding: '16px',
          color: '#F59E0B',
        },
        iconTheme: {
          primary: '#f7ce8c',
          secondary: '#F59E0B',
        }
      })
      return;
    }
    this.connection.disabler = false;
    this.uploaded = false;
    const mediaUpload:any = [];
    if(!!this.images.length) {
      for (let index = 0; index < this.images.length; index++) {
        mediaUpload.push(this.mediaService.uploadMedia('deal', this.images[index]));
      }
    }

    this.data.mediaUrl = [];
    combineLatest(mediaUpload)
        .pipe(
          take(1),
          exhaustMap((mainResponse:any) => {
            mainResponse.forEach((res:any)=> {
              if (!res.hasErrors()) {
                this.data.mediaUrl?.push(res.data.url);
              } else {
                return of(null);
              }
            })
            return this.dealService.createDeal(this.data);
          }),
        ).subscribe(async (res) => {
        if(!res.hasErrors()) {
          this.uploaded = true;
          return await this.modal.open();
        }
    })
  }

  async closeModal() {
    return await this.modal.close().then(() => {
      this.router.navigate(['/deals/view-deal'])
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
