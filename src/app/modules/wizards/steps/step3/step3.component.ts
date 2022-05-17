import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { User } from '@core/models/user.model';
import { Subject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
import { ModalConfig } from './../../../../@core/models/modal.config';
import { MainDeal } from './../../models/main-deal.model';
import { ConnectionService } from './../../services/connection.service';

enum CheckBoxType { ONE, TWO, NONE };

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
})
export class Step3Component implements OnInit, OnDestroy {

  check_box_type = CheckBoxType;
  currentlyChecked: CheckBoxType;

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

  btnDisable: boolean;

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
    termsAndCondition: '',
    vouchers: [
      {
        voucherEndDate: '',
        voucherStartDate: '',
        voucherValidity: 0
      }
    ]
  };

  reciever: Subscription;
  data: MainDeal;
  policy: Partial<User>;
  editIndex: number = -1;

  private unsubscribe: Subscription[] = [];

  constructor(private fb: FormBuilder, private connection: ConnectionService, private authService: AuthService) {
    this.reciever = this.connection.getData().subscribe((response: MainDeal) => {
      if(response) {
        this.data = response;
        //console.log(this.data);
      }
    })
  }

  ngOnInit() {
    this.authService.retreiveUserPolicy();
    this.initDateForm();
    this.initPolicyForm();
    this.updateParentModel({}, this.checkForm());
    this.policy = this.authService.userPolicy;

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
          'indent',
          'outdent',
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
      this.btnDisable = true;
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
          Validators.required
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
        this.data.vouchers[0]?.voucherStartDate,
        Validators.compose([
          Validators.required
        ])
      ],
      voucherEndDate: [
        this.data.vouchers[0]?.voucherEndDate,
        Validators.compose([
          Validators.required
        ])
      ],
      termsAndCondition: [
        {value: this.data.termsAndCondition, disabled: true},
        Validators.compose([
          Validators.required
        ])
      ],
      voucherValidity: [
        this.data.vouchers[0]?.voucherValidity,
        Validators.compose([
          Validators.required
        ])
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
      this.updateParentModel(this.data, this.checkForm());
      this.connection.sendData(this.data);
      console.log(this.data)
    });
    this.unsubscribe.push(formChangesSubscr);
  }

  checkForm() {
    return !(
      this.form.get('voucherStartDate')?.hasError('required') ||
      this.form.get('voucherEndDate')?.hasError('required') ||
      this.form.get('voucherValidity')?.hasError('required')
    );
  }

  handleMinus() {
    if(this.form.controls['voucherValidity'].value >= 1) {
      this.form.patchValue({
        voucherValidity: this.form.controls['voucherValidity'].value - 1
      });
    }
  }

  handlePlus() {
    this.form.patchValue({
      voucherValidity: this.form.controls['voucherValidity'].value + 1
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


  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.reciever.unsubscribe();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
