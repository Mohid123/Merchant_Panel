import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg, FullCalendarComponent } from '@fullcalendar/angular';
import { HotToastService } from '@ngneat/hot-toast';
import * as moment from 'moment';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
import { MainDeal } from '../../models/main-deal.model';
import { createEventId } from '../step4/event-utils';
import { ModalConfig } from './../../../../@core/models/modal.config';
import { DealService } from './../../../../@core/services/deal.service';
import { MediaService } from './../../../../@core/services/media.service';
import { ConnectionService } from './../../services/connection.service';

@Component({
  selector: 'app-step5',
  templateUrl: './step5.component.html',
})
export class Step5Component implements OnInit, AfterViewInit {

  @ViewChild('fullCalendar') fullCalendar: FullCalendarComponent;
  @Input() images: Array<any>;
  @ViewChild('modal') private modal: ReusableModalComponent;
  @ViewChild('modal2') private modal2: ReusableModalComponent;
  @Output() prevClick = new EventEmitter();
  uploaded: boolean;
  yesClick: boolean = false;

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
  secondReciever: Subscription;
  data: MainDeal;
  newData: MainDeal;
  clickInfo: any;
  destroy$ = new Subject();

  private unsubscribe: Subscription[] = [];

  constructor(
    private connection: ConnectionService,
    private dealService: DealService,
    private mediaService: MediaService,
    private router: Router,
    private cf: ChangeDetectorRef,
    private toast: HotToastService) {
      this.reciever = this.connection.getData().subscribe((response: MainDeal) => {
        this.data = response;
        this.images = this.data.mediaUrl;
      })
      this.uploaded = true;

      this.secondReciever = this.connection.getSaveAndNext().subscribe((response: MainDeal) => {
        this.newData = response;
      })
    }

  ngOnInit() {
    this.updateParentModel({}, true);
  }

  ngAfterViewInit(): void {
    this.fullCalendar.getApi().render();
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
      this.newData.startDate = selectInfo.startStr;
      this.newData.endDate = selectInfo.endStr;
      calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      });
    }
  }

  yesClickTrue() {
    this.yesClick = true;
    if(this.yesClick == true) {
      this.clickInfo.remove();
      this.data.startDate = '';
      this.data.endDate = '';
      this.modal2.close();
    }
  }

  closeSecondModal() {
    this.modal2.close();
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.clickInfo = clickInfo.event;
    return this.modal2.open();
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
    this.newData.pageNumber = 5;
    this.newData.dealStatus = 'In Review';
    const payload = this.newData;
    this.dealService.createDeal(payload).pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.connection.isSaving.next(false);
        this.connection.sendSaveAndNext(res.data);
        this.uploaded = true;
        this.connection.currentStep$.next(1);
        return this.modal.open();
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
    this.secondReciever.unsubscribe();
    this.reciever.unsubscribe();
  }
}
