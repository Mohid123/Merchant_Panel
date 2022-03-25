import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg } from '@fullcalendar/angular';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { MainDeal } from '../../models/main-deal.model';
import { createEventId } from './event-utils';

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
})
export class Step4Component implements OnInit {

  currentEvents: EventApi[] = [];
  calendarOptions: CalendarOptions = {
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
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
  @Input('updateParentModel') updateParentModel: (
    part: Partial<MainDeal>,
    isFormValid: boolean
  ) => void;
  form: FormGroup;
  @Input() deal: Partial<MainDeal>;

  private unsubscribe: Subscription[] = [];

  constructor(private fb: FormBuilder, private modalService: NgbModal) {}

  ngOnInit() {
    this.initForm();
    this.updateParentModel({}, true);
  }

  openVerticallyCentered(content: any) {
    this.modalService.open(content, { centered: true });
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
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove();
    }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  }

  initForm() {
    // this.form = this.fb.group({
    //   nameOnCard: [this.defaultValues.nameOnCard, [Validators.required]],
    //   cardNumber: [this.defaultValues.cardNumber, [Validators.required]],
    //   cardExpiryMonth: [
    //     this.defaultValues.cardExpiryMonth,
    //     [Validators.required],
    //   ],
    //   cardExpiryYear: [
    //     this.defaultValues.cardExpiryYear,
    //     [Validators.required],
    //   ],
    //   cardCvv: [this.defaultValues.cardCvv, [Validators.required]],
    //   saveCard: ['1'],
    // });

    // const formChangesSubscr = this.form.valueChanges.subscribe((val) => {
    //   this.updateParentModel(val, this.checkForm());
    // });
    // this.unsubscribe.push(formChangesSubscr);
  }

  // checkForm() {
  //   return !(
  //     this.form.get('nameOnCard')?.hasError('required') ||
  //     this.form.get('cardNumber')?.hasError('required') ||
  //     this.form.get('cardExpiryMonth')?.hasError('required') ||
  //     this.form.get('cardExpiryYear')?.hasError('required') ||
  //     this.form.get('cardCvv')?.hasError('required')
  //   );
  // }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
