import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ReusableModalComponent } from '@components/reusable-modal/reusable-modal/reusable-modal.component';
import { ApiResponse } from '@core/models/response.model';
import { User } from '@core/models/user.model';
import { DealService } from '@core/services/deal.service';
import { MediaService } from '@core/services/media.service';
import { CalendarOptions, EventApi, FullCalendarComponent } from '@fullcalendar/angular';
import { NgbDateStruct, NgbInputDatepicker, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { CommonFunctionsService } from '@pages/services/common-functions.service';
import * as moment from 'moment';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { ModalConfig } from '../../../../@core/models/modal.config';
import { MainDeal } from '../../models/main-deal.model';
import { ConnectionService } from '../../services/connection.service';
import { VideoProcessingService } from '../../services/video-to-img.service';
import { MediaUpload } from './../../../../@core/models/requests/media-upload.model';

enum CheckBoxType { ONE, TWO, NONE };

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
  encapsulation: ViewEncapsulation.None
})
export class Step4Component implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('fullCalendar') fullCalendar?: FullCalendarComponent;

  minDate: NgbDateStruct;
  check_box_type = CheckBoxType;
  currentlyChecked: CheckBoxType;

  @ViewChild('modal') private modal: ReusableModalComponent;
  @ViewChild('dPicker') public dPicker: NgbInputDatepicker;

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

  btnDisable: boolean;
  editable: boolean = false

  @Output() nextClick = new EventEmitter();
  @Output() prevClick = new EventEmitter();

  @Input('updateParentModel') updateParentModel: (
    part: Partial<MainDeal>,
    isFormValid: boolean
  ) => void;

  config: any;

  public Editor = ClassicEditor
  public isDisabled: boolean = true;

  form: FormGroup;
  dateForm: FormGroup;
  // policyForm: FormGroup;
  destroy$ = new Subject();
  ngbStart: any;
  ngbEnd: any;

  @Input() deal: Partial<MainDeal> = {
    subDeals: [
      {
        voucherEndDate: '',
        voucherStartDate: '',
        voucherValidity: 0
      }
    ]
  };
  disabled: boolean = false;

  reciever: Subscription;
  secondReciever: Subscription;
  data: MainDeal;
  newData: MainDeal;
  policy: Partial<User>;
  editIndex: number = -1;
  id: string;
  disableBackButton: boolean;
  videoFromEdit: any;
  editUrl: any;
  multiples: any[];
  dealStatus: string;
  isObject: any;

  start: any;
  endDateInView: any;
  end: any;
  allDay: any;

  dealStart: any;
  dealEnd: any;
  startedUpload: boolean = false;
  uploaded: boolean = true;

  @ViewChild('dateModal') private dateModal: TemplateRef<any>;

  currentEvents: EventApi[] = [];
  calendarOptions: CalendarOptions = {
  headerToolbar: {
    left: 'prev,next',
    center: 'title',
    right: 'today'
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
  contentHeight: 'auto',
  displayEventTime: false,
  initialDate: moment().add(2, 'days').format('YYYY-MM-DD'),
  validRange: {
    start: moment().add(2, 'days').format('YYYY-MM-DD')
  }
};
  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    public connection: ConnectionService,
    private authService: AuthService,
    private userService: UserService,
    private toast: HotToastService,
    private cf: ChangeDetectorRef,
    private dealService: DealService,
    private videoService: VideoProcessingService,
    private modalService: NgbModal,
    private mediaService: MediaService,
    private common: CommonFunctionsService) {

      this.disableBackButton = false;

      this.mediaService.uploadInProgress$.subscribe((value: boolean) => {
        this.startedUpload = value;
      });

      this.reciever = this.connection.getData().subscribe((response: MainDeal) => {
        if(response) {
          this.data = response;
        }
      });

      this.secondReciever = this.connection.getSaveAndNext().subscribe((response: MainDeal) => {
        if(response) {
          this.newData = response;

          this.dealStatus = response.dealStatus;
          this.id = response?.id;


          if(response?.startDate && response?.endDate) {

            const dealStart = new Date(response?.startDate);
            const endDate = new Date(response?.endDate);
            dealStart.setDate(dealStart.getDate());
            endDate.setDate(endDate.getDate());

            this.dealStart = { day: dealStart.getUTCDate(), month: dealStart.getUTCMonth() + 1, year: dealStart.getUTCFullYear() }
            this.dealEnd = { day: endDate.getUTCDate(), month: endDate.getUTCMonth() + 1, year: endDate.getUTCFullYear() }
          }

          if(response.subDeals) {
            this.isObject = typeof response?.subDeals[0]?.voucherStartDate;
          }

          if(response?.subDeals[0]?.voucherStartDate && this.isObject != "object") {
            const newStart = new Date(response?.subDeals[0]?.voucherStartDate);
            const newEnd = new Date(response?.subDeals[0]?.voucherEndDate);
            newStart.setDate(newStart.getDate());
            newEnd.setDate(newEnd.getDate());
            this.ngbStart = { day: newStart.getUTCDate(), month: newStart.getUTCMonth() + 1, year: newStart.getUTCFullYear() }
            this.ngbEnd = { day: newEnd.getUTCDate(), month: newEnd.getUTCMonth() + 1, year: newEnd.getUTCFullYear() }
          }

          if(response.dealStatus == 'Published' || response.dealStatus == 'Scheduled') {
            response.mediaUrl.filter((image: MediaUpload) => {
              if(image.captureFileURL.endsWith('.mp4')) {
                this.videoFromEdit = image;
                this.editUrl = image.captureFileURL;
              }
              else {
                this.videoService.getBase64ImageFromUrl(image.captureFileURL)
                .then((result: any) => {
                  const resulted = [result]
                  this.multiples = resulted;
                })
                .catch(err => console.log(err))
                .finally(() => {
                  const data = {
                    subCategory: response.subCategory,
                    dealHeader: response.dealHeader,
                    subTitle: response.subTitle,
                    mediaUrl: this.multiples,
                    subDeals: response.subDeals,
                    finePrints: response.finePrints,
                    highlights: response.highlights,
                    aboutThisDeal: response.aboutThisDeal,
                    readMore: response.readMore,
                    deletedCheck: false,
                    pageNumber: 4
                  }
                  this.connection.sendData(data);
                });
              }
            });
            this.disableBackButton = true
          }
        }
      })

      const current = new Date();
      if(!!this.isLastDay(current)) {
        if(!!this.isLastDayofYear(current)) {
          this.minDate = { year: current.getFullYear() + 1, month: 1, day: 2}
        }
        else {
          this.minDate = { year: current.getFullYear(), month: current.getMonth() + 2, day: 2}
        }
      }
      else if(!!this.isSecondLastDay(current)) {
        if(!!this.isSecondLastDayofYear(current)) {
          this.minDate = { year: current.getFullYear() + 1, month: 1, day: 1}
        }
        else {
          this.minDate = { year: current.getFullYear(), month: current.getMonth() + 2, day: 1}
        }
      }
      else {

        this.minDate = { year: current.getFullYear(), month: current.getMonth() + 1, day: current.getDate() + 2}
      }
  }


  ngOnInit() {
    this.initDateForm();
    this.initSelectDateForm();
    this.updateParentModel({}, true);

    this.config = {
      language: 'en',
      toolbar: {
        styles: [
            'alignLeft', 'alignCenter', 'alignRight', 'full', 'side'
            ],
        items: [
          'heading',
          'fontSize',
          'bold',
          'italic',
          'underline',
          'highlight',
          'alignment',
          'undo',
          'redo'
        ]
      }
    };

    this.dateForm.get('startDate')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe((value: any) => {
      const startDate = new Date(value?.year, value?.month - 1, value?.day).getTime();
      if(this.dateForm.get('endDate')?.value != "" || this.dateForm.get('endDate')?.value != null) {
        const end = new Date(this.dateForm.get('endDate')?.value?.year, this.dateForm.get('endDate')?.value?.month - 1, this.dateForm.get('endDate')?.value?.day).getTime();
        if(startDate > end) {
          this.dateForm.get('startDate')?.setValue('');
          this.toast.warning('Start date cannot exceed the end date');
        }
      }
    })

    this.form.get('voucherStartDate')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe((value: any) => {
      const startDate = new Date(value?.year, value?.month - 1, value?.day).getTime();
      if(this.form.get('voucherEndDate')?.value != "" || this.form.get('voucherEndDate')?.value != null) {
        const end = new Date(this.form.get('voucherEndDate')?.value?.year, this.form.get('voucherEndDate')?.value?.month - 1, this.form.get('voucherEndDate')?.value?.day).getTime();
        if(startDate > end) {
          this.form.get('voucherStartDate')?.setValue('');
          this.toast.warning('Start date cannot exceed the end date');
        }
      }
    })

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.fullCalendar?.getApi().render();
    });

    if(this.dealStatus == 'Published' || this.dealStatus == 'Scheduled') {
      this.form.get('voucherStartDate')?.disable();
      this.form.get('voucherEndDate')?.disable();
      this.form.get('voucherValidity')?.disable();
    }

    if(this.ngbStart) {
      this.form.get('voucherStartDate')?.setValue(this.ngbStart);
      this.form.get('voucherEndDate')?.setValue(this.ngbEnd);
    }

    if(this.dealStart && this.dealEnd) {
      this.dateForm.get('startDate')?.setValue(this.dealStart);
      this.dateForm.get('endDate')?.setValue(this.dealEnd);
    }

    if(this.form.get('voucherStartDate')?.value && this.form.get('voucherEndDate')?.value) {
      this.currentlyChecked = this.check_box_type.ONE
    }
    else {
      this.form.get('voucherStartDate')?.disable();
      this.form.get('voucherEndDate')?.disable();
    }

    if(this.form.get('voucherValidity')?.value) {
      this.currentlyChecked = this.check_box_type.TWO
    }
    else {
      this.btnDisable = true;
      this.form.get('voucherValidity')?.setValue(0);
      this.form.get('voucherValidity')?.disable();
      this.cf.detectChanges();
    }
  }

  isLastDay(date: any) {
    return new Date(date.getTime() + 86400000).getDate() === 1;
  }

  isSecondLastDay(date: any) {
    const localDate = new Date();
    const currentYear = localDate.getFullYear();
    const currentMonth = localDate.getMonth() + 1;
    const year = date.getFullYear();
    const leap = new Date(year, 1, 29).getDate() === 29;
    const checkFeb = date.toDateString();

    if(leap) {
      if(checkFeb.includes('Feb 28')) {
        return new Date(date.getTime() + 86400000).getDate() === 29;
      }
    }
    else {

      if(checkFeb.includes('Feb 27')) {

       return new Date(date.getTime() + 86400000).getDate() === 28;
      }
      else {
        if(this.getDaysInMonth(currentYear, currentMonth) === 31) {

          return new Date(date.getTime() + 86400000).getDate() === 31
        }
        else if(this.getDaysInMonth(currentYear, currentMonth) === 30) {

          return new Date(date.getTime() + 86400000).getDate() === 30
        }
      }
    }
  }

  getDaysInMonth(year: any, month: any) {
    return new Date(year, month, 0).getDate();
  }

  isLastDayofYear(date: any) {
    const year = date.getFullYear();
    return new Date(year, 11, 31).toDateString() === date.toDateString();
  }

  isSecondLastDayofYear(date: any) {
    const year = date.getFullYear();
    return new Date(year, 11, 30).toDateString() === date.toDateString();
  }

  selectCheckBox(targetType: CheckBoxType) {
    if(this.currentlyChecked === targetType) {
      this.currentlyChecked = CheckBoxType.NONE;
      return;
    }
    this.currentlyChecked = targetType;
  }

  disableCheckBox() {
    if(this.currentlyChecked == this.check_box_type.ONE) {
      this.btnDisable = true;
      this.form.controls['voucherValidity'].disable();
      this.form.get('voucherValidity')?.setValue(0);
      this.form.controls['voucherStartDate'].enable();
      this.form.controls['voucherEndDate'].enable();
    }
    else if(this.currentlyChecked == this.check_box_type.TWO) {
      this.btnDisable = false;
      this.form.controls['voucherValidity'].enable();
      this.form.get('voucherStartDate')?.setValue('');
      this.form.get('voucherEndDate')?.setValue('');
      this.form.controls['voucherStartDate'].disable();
      this.form.controls['voucherEndDate'].disable();
    }
  }

  toggleDisabled() {
    if(this.form.controls['termsAndCondition']?.disabled) {
      this.form.controls['termsAndCondition']?.enable();
    }
    else {
      this.form.controls['termsAndCondition']?.disable();
    }
  }

  initDateForm() {
    this.form = this.fb.group({
      voucherStartDate: [
        this.newData.subDeals[0]?.voucherStartDate,
        Validators.compose([
          Validators.required
        ])
      ],
      voucherEndDate: [
        this.newData.subDeals[0]?.voucherEndDate,
        Validators.compose([
          Validators.required
        ])
      ],
      voucherValidity: [
        this.newData.subDeals[0]?.voucherValidity,
        Validators.compose([
          Validators.required,
          Validators.min(30)
        ])
      ]
    });

    const formChangesSubscr = this.form.valueChanges.subscribe((val) => {
      if(this.newData.subDeals[0] != null) {
        this.newData.subDeals?.forEach((voucher) => {
          if (val.voucherValidity) {
            voucher.voucherValidity = val.voucherValidity;
            voucher.voucherStartDate ='';
            voucher.voucherEndDate ='';
          } else {
            voucher.voucherValidity = 0;
            voucher.voucherStartDate = val.voucherStartDate;
            voucher.voucherEndDate = val.voucherEndDate;
          }
        });
      }
      this.updateParentModel(val, true);
    });
    this.unsubscribe.push(formChangesSubscr);
  }

  initSelectDateForm() {
    this.dateForm = this.fb.group({
      startDate: [
        this.newData.startDate,
        Validators.compose([
          Validators.required
        ])
      ],
      endDate: [
        this.newData.endDate,
        Validators.compose([
          Validators.required
        ])
      ]
    });

    const formChangesSubscr = this.form.valueChanges.subscribe((val) => {
      if(this.newData.startDate && this.newData.endDate) {
        this.newData.startDate = val.startDate;
        this.newData.endDate = val.endDate;
      }
      this.updateParentModel(val, true);
    });
    this.unsubscribe.push(formChangesSubscr);
  }

  checkForm() {
    return !(
      this.form.get('voucherStartDate')?.hasError('required') ||
      this.form.get('voucherEndDate')?.hasError('required') ||
      this.form.get('voucherValidity')?.hasError('required') ||
      this.form.get('voucherValidity')?.hasError('min')
    );
  }

  handleMinus() {
    if(this.form.controls['voucherValidity'].value >= 1) {
      this.form.patchValue({
        voucherValidity: parseInt(this.form.get('voucherValidity')?.value) - 1
      });
    }
  }

  handlePlus() {
    this.form.patchValue({
      voucherValidity: parseInt(this.form.get('voucherValidity')?.value) + 1
    });
  }

  openDateModal() {
    const startDate = new Date(this.dateForm.get('startDate')?.value?.year, this.dateForm.get('startDate')?.value?.month - 1, this.dateForm.get('startDate')?.value?.day).getTime();
    const endDate = new Date(this.dateForm.get('endDate')?.value?.year, this.dateForm.get('endDate')?.value?.month - 1, this.dateForm.get('endDate')?.value?.day).getTime();
    if(startDate > endDate) {
      this.dateForm.invalid;
      return;
    }
    this.start = moment(startDate).format("YYYY-MM-DD");
    this.endDateInView = moment(endDate).format("YYYY-MM-DD");
    this.end = moment(endDate).add(1, 'days').format("YYYY-MM-DD");
    const dateValues = {
      title: this.newData?.dealHeader,
      start: this.start,
      end: this.end,
      allDay: this.allDay,
    }
    const newDateArr = [];
    newDateArr.push(dateValues);
    this.calendarOptions.events = newDateArr.map((value: any) => {
      return {
        title: value.title,
        start: value.start,
        end: value.end,
        backgroundColor: '#0081E9',
        borderColor: '#0081E9',
        extendedProps: {}
      }
    });
    this.calendarOptions.initialDate = this.start;

    return this.modalService.open(this.dateModal, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
      modalDialogClass: 'date-large'
    })
  }

  closeDateModal() {
    return this.modalService.dismissAll();
  }

  async closeModal() {
    return await this.modal.close().then(() => {
      this.router.navigate(['/deals/view-deal']);
    });
  }

  disableManual(e: any) {
    e.preventDefault()
  }

  sendDraftData() {
    if(this.form.disabled == true || this.form.invalid == true || !this.dateForm.get('startDate')?.value || !this.dateForm.get('endDate')?.value) {
      this.form.markAllAsTouched();
      this.dateForm.markAllAsTouched();
      return;
    }
    else {
      this.uploaded = false;
      this.newData.pageNumber = 4;
      return new Promise((resolve, reject) => {
        this.newData.subDeals?.forEach((voucher) => {
          if (this.form.get('voucherValidity')?.value) {
            voucher.voucherValidity = parseInt(this.form.get('voucherValidity')?.value);
            voucher.voucherStartDate = 0;
            voucher.voucherEndDate = 0;
          } else {
            voucher.voucherValidity = 0;
            voucher.voucherStartDate = new Date(new Date().setUTCFullYear(this.form.get('voucherStartDate')?.value?.year, this.form.get('voucherStartDate')?.value?.month - 1, this.form.get('voucherStartDate')?.value?.day)).setUTCHours(0,0,0,0);
            voucher.voucherEndDate = new Date(new Date().setUTCFullYear(this.form.get('voucherEndDate')?.value?.year, this.form.get('voucherEndDate')?.value?.month - 1, this.form.get('voucherEndDate')?.value?.day)).setUTCHours(23,59,59,0);
          }
        });
        const startDate = new Date(this.dateForm.get('startDate')?.value?.year, this.dateForm.get('startDate')?.value?.month - 1, this.dateForm.get('startDate')?.value?.day).getTime();
        const endDate = new Date(this.dateForm.get('endDate')?.value?.year, this.dateForm.get('endDate')?.value?.month - 1, this.dateForm.get('endDate')?.value?.day).getTime();
        this.newData.startDate = moment(startDate).format("YYYY-MM-DD");
        this.newData.endDate = moment(endDate).format("YYYY-MM-DD");
        this.newData.dealStatus = 'In review';
        const payload = this.newData;
        this.dealService.createDeal(payload).pipe(takeUntil(this.destroy$))
        .subscribe((res: ApiResponse<any>) => {
          if(!res.hasErrors()) {
            this.connection.isSaving.next(false);
            resolve('success');
            this.uploaded = true;
            return this.modal.open().then(() => {
              this.connection.currentStep$.next(1);
              this.connection.isEditMode = false;
              this.connection.sendStep1({});
              this.connection.sendSaveAndNext({});
              this.connection.sendData({})
            });
          }
          else {
            reject('error')
            this.toast.error('Failed to create deal');
          }
        });
      })
    }
  }

  returnToPrevious() {
    this.prevClick.emit('');
    // this.common.deleteDealByID(this.id);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.reciever.unsubscribe();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}



// async openNew() {
  //   this.policyForm.patchValue({
  //     streetAddress: this.policy?.streetAddress,
  //     city: this.policy?.city,
  //     zipCode: this.policy?.zipCode
  //   })
  //   return await this.modal.open();
  // }

  // async closeModal() {
  //   return await this.modal.close();
  // }


  // initPolicyForm() {
  //   this.policyForm = this.fb.group({
  //     streetAddress: [
  //       '',
  //       Validators.compose([
  //         Validators.required
  //       ])
  //     ],
  //     zipCode: [
  //       '',
  //       Validators.compose([
  //         Validators.required,
  //         Validators.minLength(4)
  //       ])
  //     ],
  //     city: [
  //       '',
  //       Validators.compose([
  //         Validators.required
  //       ])
  //     ],
  //     // province: [
  //     //   '',
  //     //   Validators.compose([
  //     //     Validators.required,
  //     //     Validators.pattern('^[ a-zA-Z][a-zA-Z ]*$')
  //     //   ])
  //     // ]
  //   })
  // }

  // enableEdit() {
  //   this.editable = true;
  //   this.policyForm.patchValue({
  //     streetAddress: this.policy?.streetAddress,
  //     city: this.policy?.city,
  //     zipCode: this.policy?.zipCode
  //   })
  // }

  // editPolicyForm() {
  //   this.editable = true;
  //   this.disabled = true;
  //   this.userService.updateLocation(this.policyForm.value)
  //   .pipe(exhaustMap((res: any) => {
  //     if(!res.hasErrors()) {
  //       this.toast.success('Data updated', {
  //         style: {
  //           border: '1px solid #65a30d',
  //           padding: '16px',
  //           color: '#3f6212',
  //         },
  //         iconTheme: {
  //           primary: '#84cc16',
  //           secondary: '#064e3b',
  //         },
  //       });
  //       this.editable = false;
  //       return this.userService.getUser();
  //       } else {
  //         return (res);
  //       }
  //   })).subscribe((res: any) => {
  //     this.disabled = false;
  //     this.policy = res.data.personalDetail;
  //     console.log(res);
  //   })
  // }

  // discardLower() {
  //   this.editable = false;
  //   this.policyForm.patchValue({
  //     streetAddress: this.policy?.streetAddress,
  //     city: this.policy?.city,
  //     zipCode: this.policy?.city
  //   });
  // }
