import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Subscription } from 'rxjs';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
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
        voucherEndDate: Date.toString(),
        voucherStartDate: Date.toString(),
        voucherValidity: 0
      }
    ]
  };

  reciever: Subscription;
  data: MainDeal;

  private unsubscribe: Subscription[] = [];

  constructor(private fb: FormBuilder, private connection: ConnectionService) {
    this.reciever = this.connection.getData().subscribe((response: MainDeal) => {
      if(response) {
        this.data = response;
        //console.log(this.data);
      }
    })
  }

  ngOnInit() {
    this.initDateForm();
    this.updateParentModel({}, this.checkForm());

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
       this.convertToPlain(val.termsAndCondition);
      });
      const updatedData = {...this.data}
      this.updateParentModel(updatedData, this.checkForm());
      this.connection.sendData(updatedData);
      // console.log(updatedData)
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

  convertToPlain(html: any){
    var tempDivElement = document.createElement("div");
    tempDivElement.innerHTML = html;
    return tempDivElement.textContent || tempDivElement.innerText || "";
}


  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.reciever.unsubscribe();
  }
}
