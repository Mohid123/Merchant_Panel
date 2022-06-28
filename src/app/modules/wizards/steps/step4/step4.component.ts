import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ApiResponse } from '@core/models/response.model';
import { User } from '@core/models/user.model';
import { DealService } from '@core/services/deal.service';
import { NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { Subject, Subscription } from 'rxjs';
import { exhaustMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
import { ModalConfig } from '../../../../@core/models/modal.config';
import { MainDeal } from '../../models/main-deal.model';
import { ConnectionService } from '../../services/connection.service';

enum CheckBoxType { ONE, TWO, NONE };

@Component({
  selector: 'app-step4',
  templateUrl: './step4.component.html',
})
export class Step4Component implements OnInit, OnDestroy {

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

  @Input() deal: Partial<MainDeal> = {
    vouchers: [
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

  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private connection: ConnectionService,
    private authService: AuthService,
    private userService: UserService,
    private toast: HotToastService,
    private cf: ChangeDetectorRef,
    private dealService: DealService) {
    this.reciever = this.connection.getData().subscribe((response: MainDeal) => {
      if(response) {
        this.data = response;
      }
    })

    this.secondReciever = this.connection.getSaveAndNext().subscribe((response: any) => {
      if(response) {
        this.newData = response;
      }
    })
  }

  ngOnInit() {
    this.initDateForm();
    this.initPolicyForm();
    this.updateParentModel({}, true);
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | any) => {
      this.policy = user;
      if(user)
      this.policyForm.patchValue(user);
   });

    if(this.form.get('voucherStartDate')?.value && this.form.get('voucherEndDate')?.value) {
      this.currentlyChecked = this.check_box_type.ONE
    }
    else {
      this.form.get('voucherStartDate')?.setValue('')
      this.form.get('voucherEndDate')?.setValue('')
    }

    if(!this.form.controls['voucherValidity'].value) {
      this.form.controls['voucherValidity'].disable();
      this.cf.detectChanges();
      this.btnDisable = true;
      this.form.controls['voucherValidity'].setValue(0);
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

  openDatePicker() {
    this.dPicker.open();
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
      province: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[ a-zA-Z][a-zA-Z ]*$')
        ])
      ]
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
        this.data.vouchers[0]?.voucherStartDate
      ],
      voucherEndDate: [
        this.data.vouchers[0]?.voucherEndDate
      ],
      voucherValidity: [
        this.data.vouchers[0]?.voucherValidity
      ]
    });

    const formChangesSubscr = this.form.valueChanges.subscribe((val) => {
      this.data.vouchers?.forEach((voucher) => {
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
      this.updateParentModel(this.data, true);
      this.connection.sendData(this.data);
    });
    this.unsubscribe.push(formChangesSubscr);
  }

  checkForm() {
    // return !(
    //   this.form.get('voucherStartDate')?.hasError('required') ||
    //   this.form.get('voucherEndDate')?.hasError('required') ||
    //   this.form.get('voucherValidity')?.hasError('required')
    // );
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
    this.connection.isSaving.next(true);
    this.nextClick.emit('');
    this.newData.pageNumber = 4;
    this.newData.vouchers?.forEach((voucher) => {
      if (this.form.get('voucherValidity')?.value) {
        voucher.voucherValidity = this.form.get('voucherValidity')?.value;
        voucher.voucherStartDate = '';
        voucher.voucherEndDate = '';
      } else {
        voucher.voucherValidity = 0;
        voucher.voucherStartDate = new Date(this.form.get('voucherStartDate')?.value?.year, this.form.get('voucherStartDate')?.value?.month - 1, this.form.get('voucherStartDate')?.value?.year).getTime();
        voucher.voucherEndDate = new Date(this.form.get('voucherEndDate')?.value?.year, this.form.get('voucherEndDate')?.value?.month - 1, this.form.get('voucherEndDate')?.value?.day).getTime();
      }
    });

    const payload = this.newData;
    this.dealService.createDeal(payload).pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.connection.isSaving.next(false);
        this.connection.sendSaveAndNext(res.data);
      }
    })
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.reciever.unsubscribe();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}

