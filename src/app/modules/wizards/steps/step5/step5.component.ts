import { AfterViewInit, ApplicationRef, ChangeDetectorRef, Component, ComponentFactoryResolver, ComponentRef, EventEmitter, Injector, Input, OnInit, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { CalendarOptions, EventApi, FullCalendarComponent } from '@fullcalendar/angular';
import { DateClickArg } from '@fullcalendar/interaction';
import { NgbInputDatepicker, NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
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
  template: `
    <div
      class="fc-content"
      #popoverHook="ngbPopover"
      [popoverClass]="'calendar-popover'"
      [ngbPopover]="template"
      [placement]="'right'"
      triggers="manual"
    >
      <ng-content></ng-content>
    </div>
  `
})

export class PopoverWrapperComponent {
  template: TemplateRef<any>;

  @ViewChild('popoverHook') public popoverHook: NgbPopover;
}

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
    moreLinkClick: 'popover',
    dateClick: this.handleDateClick.bind(this),
    eventClick: this.showPopover.bind(this),
    eventDidMount: this.renderTooltip.bind(this),
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
  @ViewChild('modal4') private modal4: TemplateRef<any>;
  dateForm: FormGroup;
  startDate: any;
  calendarApi: any;
  allDay: any;
  start: string;
  end: string;
  today: any;
  endDateInView: any;

  @ViewChild('popContent', { static: true }) popContent: TemplateRef<any>;
  popoversMap = new Map<any, ComponentRef<PopoverWrapperComponent>>();

  popoverFactory = this.resolver.resolveComponentFactory(PopoverWrapperComponent);

  private unsubscribe: Subscription[] = [];

  constructor(
    private connection: ConnectionService,
    private dealService: DealService,
    private mediaService: MediaService,
    private injector: Injector,
    private appRef: ApplicationRef,
    private router: Router,
    private cf: ChangeDetectorRef,
    private toast: HotToastService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private resolver: ComponentFactoryResolver) {
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
    console.log(current)
    this.today = { year: current.getFullYear(), month: current.getMonth() + 1, day: current.getDate() }
  }

  showPopover(event:any) {
    const popover = this.popoversMap.get(event.el);
    if (popover) {
      popover.instance.popoverHook.open({ event: event.event });
    }
  }

  hidePopover(event:any) {
    const popover = this.popoversMap.get(event.el);
    if (popover?.instance?.popoverHook) {
      popover.instance.popoverHook.close();
    }
  }

  renderTooltip(event:any) {
    const projectableNodes = Array.from(event.el.childNodes)

    const compRef = this.popoverFactory.create(this.injector, [projectableNodes], event.el);
    compRef.instance.template = this.popContent;

    this.appRef.attachView(compRef.hostView)
    this.popoversMap.set(event.el, compRef)
  }

  destroyTooltip(event:any) {
    const popover = this.popoversMap.get(event.el);
    if (popover) {
      this.appRef.detachView(popover.hostView);
      popover.destroy();
      this.popoversMap.delete(event.el);
    }
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
    this.endDateInView = moment(endDate).format("YYYY-MM-DD");
    this.end = moment(endDate).add(1, 'days').format("YYYY-MM-DD");
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

  discardFourthModal() {
    this.modalService.dismissAll();
    this.dateForm.reset();
  }

  editDates() {
    const start = this.start;
    const end = this.endDateInView;
    const newStart = new Date(start);
    const newEnd = new Date(end);
    const ngbStart = { day: newStart.getUTCDate(), month: newStart.getUTCMonth() + 1, year: newStart.getUTCFullYear() }
    const ngbEnd = { day: newEnd.getUTCDate(), month: newEnd.getUTCMonth() + 1, year: newEnd.getUTCFullYear() }
    console.log(ngbStart)
    console.log(ngbEnd)
    this.modalService.open(this.modal4, {
      centered: true,
      size: 'sm',
      backdrop: 'static',
      keyboard: false,
      modalDialogClass: 'small-popup'
    })
    this.cf.detectChanges()
    this.dateForm.get('startDate')?.setValue(ngbStart)
    this.dateForm.get('endDate')?.setValue(ngbEnd)
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
      this.calendarApi.removeAllEvents();
      this.data.startDate = '';
      this.data.endDate = '';
      this.modal2.close();
    }
  }

  closeSecondModal() {
    this.modal2.close();
  }

  handleEventClick() {
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
