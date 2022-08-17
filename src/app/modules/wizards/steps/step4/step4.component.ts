import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ApiResponse } from '@core/models/response.model';
import { User } from '@core/models/user.model';
import { DealService } from '@core/services/deal.service';
import { NgbDateStruct, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { CommonFunctionsService } from '@pages/services/common-functions.service';
import { Subject, Subscription } from 'rxjs';
import { exhaustMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
import { ModalConfig } from '../../../../@core/models/modal.config';
import { MainDeal } from '../../models/main-deal.model';
import { ConnectionService } from '../../services/connection.service';
import { VideoProcessingService } from '../../services/video-to-img.service';
import { MediaUpload } from './../../../../@core/models/requests/media-upload.model';

enum CheckBoxType { ONE, TWO, NONE };

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
})
export class Step4Component implements OnInit, OnDestroy {

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
  policyForm: FormGroup;
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

  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    public connection: ConnectionService,
    private authService: AuthService,
    private userService: UserService,
    private toast: HotToastService,
    private cf: ChangeDetectorRef,
    private dealService: DealService,
    private videoService: VideoProcessingService,
    private common: CommonFunctionsService) {

      this.disableBackButton = false;

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
          const isObject = typeof response?.subDeals[0]?.voucherStartDate;
          if(response.subDeals[0].voucherStartDate && isObject != "object") {
            const newStart = new Date(response?.subDeals[0]?.voucherStartDate);
            const newEnd = new Date(response?.subDeals[0]?.voucherEndDate);
            newStart.setDate(newStart.getDate() + 1);
            newEnd.setDate(newEnd.getDate() + 1);
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
      this.minDate = { year: current.getFullYear(), month: current.getMonth() + 1, day: current.getDate() + 2}
  }

  ngOnInit() {
    this.initDateForm();
    this.initPolicyForm();
    this.updateParentModel({}, true);

    if(this.dealStatus == 'Published') {
      this.form.get('voucherStartDate')?.disable();
    }

    if(this.ngbStart) {
      this.form.get('voucherStartDate')?.setValue(this.ngbStart);
      this.form.get('voucherEndDate')?.setValue(this.ngbEnd);
    }

    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | any) => {
      this.policy = user;
      if(user)
      this.policyForm.patchValue(user);
   });

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
    }

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

  initPolicyForm() {
    this.policyForm = this.fb.group({
      streetAddress: [
        '',
        Validators.compose([
          Validators.required
        ])
      ],
      zipCode: [
        '',
        Validators.compose([
          Validators.required
        ])
      ],
      city: [
        '',
        Validators.compose([
          Validators.required
        ])
      ],
      // province: [
      //   '',
      //   Validators.compose([
      //     Validators.required,
      //     Validators.pattern('^[ a-zA-Z][a-zA-Z ]*$')
      //   ])
      // ]
    })
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
          Validators.min(1)
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

  async openNew() {
    this.policyForm.patchValue(this.policy);
    return await this.modal.open();
  }

  async closeModal() {
    return await this.modal.close();
  }

  disableManual(e: any) {
    e.preventDefault()
  }

  editPolicyForm() {
    this.editable = true;
    this.disabled = true;
    this.userService.updateMerchantprofile(this.policyForm.value)
    .pipe(exhaustMap((res: any) => {
      if(!res.hasErrors()) {
        this.toast.success('Data updated', {
          style: {
            border: '1px solid #65a30d',
            padding: '16px',
            color: '#3f6212',
          },
          iconTheme: {
            primary: '#84cc16',
            secondary: '#064e3b',
          },
        });
        this.editable = false;
        return this.userService.getUser();
        } else {
          return (res);
        }
    })).subscribe((res: any) => {
      this.disabled = false;
      console.log(res);
    })
  }

  discardLower() {
    this.editable = false;
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | any) => {
      this.policy = user;
      if(user)
      this.policyForm.patchValue(user);
   });
  }

  sendDraftData() {
    if(!this.checkForm()) {
      this.form.markAllAsTouched();
      return;
    }
    else {
      this.connection.isSaving.next(true);
      this.nextClick.emit('');
      this.newData.pageNumber = 4;
      return new Promise((resolve, reject) => {
        this.newData.subDeals?.forEach((voucher) => {
          if (this.form.get('voucherValidity')?.value) {
            voucher.voucherValidity = this.form.get('voucherValidity')?.value;
            voucher.voucherStartDate = '';
            voucher.voucherEndDate = '';
          } else {
            voucher.voucherValidity = 0;
            voucher.voucherStartDate = new Date(this.form.get('voucherStartDate')?.value?.year, this.form.get('voucherStartDate')?.value?.month - 1, this.form.get('voucherStartDate')?.value?.day).getTime();
            // const start = new Date(this.form.get('voucherStartDate')?.value?.year, this.form.get('voucherStartDate')?.value?.month - 1, this.form.get('voucherStartDate')?.value?.day);
            // console.log(moment(start).tz('Etc/GMT', false).utc().format("YYYY-MM-DD HH:mm"));
            voucher.voucherEndDate = new Date(this.form.get('voucherEndDate')?.value?.year, this.form.get('voucherEndDate')?.value?.month - 1, this.form.get('voucherEndDate')?.value?.day).getTime();
          }
        });
        const payload = this.newData;
        this.dealService.createDeal(payload).pipe(takeUntil(this.destroy$))
        .subscribe((res: ApiResponse<any>) => {
          if(!res.hasErrors()) {
            this.connection.isSaving.next(false);
            this.connection.sendSaveAndNext(res.data);
            resolve('success')
          }
        });
        this.data.subDeals?.forEach((voucher) => {
          if (this.form.get('voucherValidity')?.value) {
            voucher.voucherValidity = this.form.get('voucherValidity')?.value;
            voucher.voucherStartDate = '';
            voucher.voucherEndDate = '';
          } else {
            voucher.voucherValidity = 0;
            voucher.voucherStartDate = new Date(this.form.get('voucherStartDate')?.value?.year, this.form.get('voucherStartDate')?.value?.month - 1, this.form.get('voucherStartDate')?.value?.day).getTime();
            voucher.voucherEndDate = new Date(this.form.get('voucherEndDate')?.value?.year, this.form.get('voucherEndDate')?.value?.month - 1, this.form.get('voucherEndDate')?.value?.day).getTime();
          }
        });
        this.connection.sendData(this.data);
        this.connection.sendStep1(this.data);
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

