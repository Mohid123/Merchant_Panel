import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Subscription } from 'rxjs';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
import { Vouchers } from '../../models/vouchers.model';
import { ModalConfig } from './../../../../@core/models/modal.config';
import { MainDeal } from './../../models/main-deal.model';
import { ConnectionService } from './../../services/connection.service';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
})
export class Step3Component implements OnInit, OnDestroy {

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

  private unsubscribe: Subscription[] = [];

  constructor(private fb: FormBuilder, private connection: ConnectionService) {
    this.reciever = this.connection.getData().subscribe((response: MainDeal) => {
      this.data = response
      // console.log(this.data);
    })
  }

  ngOnInit() {
    this.initDateForm();
    this.updateParentModel({}, this.checkForm());

    this.config = {
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

  disableCheckBox() {
    const checkA = document.querySelector<Element | any>('#specialCheck');
    const checkB = document.querySelector<Element | any>('#specialChecked');

    if(checkA.checked == true) {
      checkB.disabled = true;
      this.btnDisable = false;
      this.form.controls['voucherValidity'].disable();
      this.form.get('voucherValidity')?.setValue(0);
      this.form.controls['voucherStartDate'].enable();
      this.form.controls['voucherEndDate'].enable();
    }
    else if(checkB.checked == true) {
      checkA.disabled = true;
      this.btnDisable = true;
      this.form.controls['voucherValidity'].enable();
      this.form.get('voucherStartDate')?.setValue('');
      this.form.get('voucherEndDate')?.setValue('');
      this.form.controls['voucherStartDate'].disable();
      this.form.controls['voucherEndDate'].disable();
    }
    else if(checkA.checked == false || checkB.checked == false) {
      checkA.disabled = false;
      checkB.disabled = false;
      this.btnDisable = false;
      this.form.controls['voucherValidity'].enable();
      this.form.controls['voucherStartDate'].enable();
      this.form.controls['voucherEndDate'].enable();
    }
  }

  toggleDisabled() {
    this.isDisabled = !this.isDisabled
  }

  initDateForm() {
    this.form = this.fb.group({
      voucherStartDate: [
        '',
        Validators.compose([
          Validators.required
        ])
      ],
      voucherEndDate: [
        '',
        Validators.compose([
          Validators.required
        ])
      ],
      termsAndCondition: [
        '',
        Validators.compose([
          Validators.required
        ])
      ],
      voucherValidity: [
        0,
        Validators.compose([
          Validators.required
        ])
      ]
    });

    const formChangesSubscr = this.form.valueChanges.subscribe((val) => {
      this.data.vouchers?.forEach((voucher: Vouchers) => {
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
      this.form.get('termsAndCondition')?.hasError('required')
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
  }
}
