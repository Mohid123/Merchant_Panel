import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Subscription } from 'rxjs';
import { ModalConfig } from './../../../../@core/models/modal.config';
import { ModalReusableComponent } from './../../../../pages/modal-reusable/modal-reusable.component';
import { MainDeal } from './../../models/main-deal.model';

@Component({
  selector: 'app-step3',
  templateUrl: './step3.component.html',
})
export class Step3Component implements OnInit {

  @ViewChild('modal') private modal: ModalReusableComponent;

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
    startDate: Date.toString(),
    endDate: Date.toString(),
    policy: '',
    validDays: 0
  };

  private unsubscribe: Subscription[] = [];

  constructor(private fb: FormBuilder) {}

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
          'numberedList',
          'bulletedList',
          'indent',
          'outdent',
          'todoList',
          'link',
          'blockQuote',
          'insertTable',
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
      this.form.controls['validDays'].disable();
      this.form.controls['startDate'].enable();
      this.form.controls['endDate'].enable();
    }
    else if(checkB.checked == true) {
      checkA.disabled = true;
      this.btnDisable = true;
      this.form.controls['validDays'].enable();
      this.form.controls['startDate'].disable();
      this.form.controls['endDate'].disable();
    }
    else if(checkA.checked == false || checkB.checked == false) {
      checkA.disabled = false;
      checkB.disabled = false;
      this.btnDisable = false;
      this.form.controls['validDays'].enable();
      this.form.controls['startDate'].enable();
      this.form.controls['endDate'].enable();
    }
  }

  toggleDisabled() {
    this.isDisabled = !this.isDisabled
  }

  initDateForm() {
    this.form = this.fb.group({
      startDate: [
        this.deal.startDate,
        Validators.compose([
          Validators.required
        ])
      ],
      endDate: [
        this.deal.endDate,
        Validators.compose([
          Validators.required
        ])
      ],
      policy: [
        this.deal.policy,
        Validators.compose([
          Validators.required
        ])
      ],
      validDays: [
        this.deal.validDays,
        Validators.compose([
          Validators.required
        ])
      ]
    });

    const formChangesSubscr = this.form.valueChanges.subscribe((val) => {
      this.updateParentModel(val, this.checkForm());
    });
    this.unsubscribe.push(formChangesSubscr);
  }

  checkForm() {
    return !(
      this.form.get('startDate')?.hasError('required') ||
      this.form.get('endDate')?.hasError('required') ||
      this.form.get('policy')?.hasError('required')
    );
  }

  handleMinus() {
    if(this.form.controls['validDays'].value >= 1) {
      this.form.patchValue({
        validDays: this.form.controls['validDays'].value - 1
      });
    }
  }

  handlePlus() {
    this.form.patchValue({
      validDays: this.form.controls['validDays'].value + 1
    });
  }

  async openNew() {
    return await this.modal.open();
  }

  async closeModal() {
    return await this.modal.close();
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
