import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { CalendarOptions, EventApi, EventClickArg, FullCalendarComponent } from '@fullcalendar/angular';
import { DateClickArg } from '@fullcalendar/interaction';
import { NgbInputDatepicker, NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  encapsulation: ViewEncapsulation.None
})
export class Step5Component implements OnInit, AfterViewInit {

  @ViewChild('fullCalendar') fullCalendar: FullCalendarComponent;
  @Input() images: Array<any>;
  @ViewChild('modal') private modal: ReusableModalComponent;
  @ViewChild('modal2') private modal2: ReusableModalComponent;
  @ViewChild('dPicker') public dPicker: NgbInputDatepicker;
  @Output() prevClick = new EventEmitter();
  uploaded: boolean;
  yesClick: boolean = false;
  daysInMonth: any;

  public modalConfig: ModalConfig = {
    onDismiss: () => {
      return true
    },
    dismissButtonLabel: "Dismiss",
    onClose: () => {
      return true
    },
    closeButtonLabel: "Close",
    size: 'sm'
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
    // select: this.handleDateSelect.bind(this),
    dateClick: this.handleDateClick.bind(this),
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
  @ViewChild('modal3') private modal3: TemplateRef<any>;
  dateForm: FormGroup;
  startDate: any;
  calendarApi: any;
  allDay: any;
  start: string;
  end: string;
  today: any;

  private unsubscribe: Subscription[] = [];

  constructor(
    private connection: ConnectionService,
    private dealService: DealService,
    private mediaService: MediaService,
    private router: Router,
    private cf: ChangeDetectorRef,
    private toast: HotToastService,
    private modalService: NgbModal,
    private fb: FormBuilder) {
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
    this.getCurrentMonthDays();
    this.initSelectDateForm();
    const current = new Date();
    this.today = { year: current.getFullYear(), month: current.getMonth() + 1, day: current.getDate() }
  }

  ngAfterViewInit(): void {
    this.fullCalendar.getApi().render();
  }

  initSelectDateForm() {
    this.dateForm = this.fb.group({
      startDate: '',
      endDate: ''
    })
  }

  getCurrentMonthDays() {
    var dt = new Date();
    var month = dt.getMonth();
    var year = dt.getFullYear();
    this.daysInMonth = (new Date(year, month, 0).getDate() + 1);
  }

  handleWeekendsToggle() {
    const { calendarOptions } = this;
    calendarOptions.weekends = !calendarOptions.weekends;
  }

  handleDateClick(selectInfo: DateClickArg) {
    const title = this.data.dealHeader;
    this.calendarApi = selectInfo.view.calendar;
    this.allDay = selectInfo.allDay

    this.calendarApi.unselect();

    if (title && !this.calendarApi.getEvents().length) {
      this.data.startDate = selectInfo.dateStr;
      this.startDate = selectInfo.dateStr;
      console.log(selectInfo)
      this.calendarApi.addEvent({
        id: createEventId(),
        title,
        start: selectInfo.dateStr,
        allDay: selectInfo.allDay
      });
      return this.modalService.open(this.modal3, {
        centered: true,
        size: 'sm',
        backdrop: 'static',
        keyboard: false,
        modalDialogClass: 'small-popup'
      });
    }
  }

  saveDates() {
    const calendarApi = this.calendarApi.view.calendar;
    calendarApi.removeAllEvents();
    const startDate = new Date(this.dateForm.get('startDate')?.value?.year, this.dateForm.get('startDate')?.value?.month - 1, this.dateForm.get('startDate')?.value?.day).getTime();
    const endDate = new Date(this.dateForm.get('endDate')?.value?.year, this.dateForm.get('endDate')?.value?.month - 1, this.dateForm.get('endDate')?.value?.day).getTime();
    this.start = moment(startDate).format("YYYY-MM-DD");
    this.end = moment(endDate).format("YYYY-MM-DD");
    calendarApi.addEvent({
      id: createEventId(),
      title: this.data.dealHeader,
      start: this.start,
      end: this.end,
      allDay: this.allDay
    })
    this.dateForm.reset();
    this.modalService.dismissAll();
  }

  openDatePicker() {
    this.dPicker.open();
  }

  closeModal3() {
    this.calendarApi.removeAllEvents();
    this.dateForm.reset();
    this.modalService.dismissAll();
  }

  // handleDateSelect(selectInfo: DateSelectArg) {
  //   const title = this.data.dealHeader;
  //   const calendarApi = selectInfo.view.calendar;

  //   calendarApi.unselect();

  //   if (title && !calendarApi.getEvents().length) {
  //     this.data.startDate = selectInfo.startStr;
  //     this.data.endDate = selectInfo.endStr;
  //     this.newData.startDate = selectInfo.startStr;
  //     this.newData.endDate = selectInfo.endStr;
  //     calendarApi.addEvent({
  //       id: createEventId(),
  //       title,
  //       start: selectInfo.startStr,
  //       end: selectInfo.endStr,
  //       allDay: selectInfo.allDay
  //     });
  //   }
  // }

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
    this.newData.dealStatus = 'In review';
    this.newData.startDate = this.start;
    this.newData.endDate = this.end;
    const payload = this.newData;
    debugger
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
