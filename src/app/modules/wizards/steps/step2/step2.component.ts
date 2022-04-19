import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
import { ModalConfig } from './../../../../@core/models/modal.config';
import { GreaterThanValidator } from './../../greater-than.validator';
import { MainDeal } from './../../models/main-deal.model';
import { ConnectionService } from './../../services/connection.service';
;

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
})
export class Step2Component implements OnInit {

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

  @Input('updateParentModel') updateParentModel: (
    part: Partial<MainDeal>,
    isFormValid: boolean
  ) => void;

  subDealForm: FormGroup;

  reciever: Subscription;
  data: MainDeal

  @Input() deal: Partial<MainDeal> = {
    vouchers: [
      {
        subTitle: '',
        dealPrice: '',
        originalPrice: '',
        details: '',
        discountPercentage: 0,
        numberOfVouchers: ''
      }
    ]
  };

  subDeals: any[] = [];

  @Input() mainDeal: Partial<MainDeal>
  @Input() images: any;

  public discount: number;

  private unsubscribe: Subscription[] = [];

  isCurrentFormValid$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );

  constructor(private fb: FormBuilder, private connection: ConnectionService) {
    this.reciever = this.connection.getData().subscribe((response: MainDeal) => {
      this.data = response
    })
  }

  ngOnInit() {
    this.initSubDealForm();
    this.updateParentModel({}, true);
  }

  get f() {
    return this.subDealForm.controls;
  }

  calculateDiscount() {
    const dealPrice = Math.round(parseInt(this.subDealForm.get('originalPrice')?.value) - parseInt(this.subDealForm.get('dealPrice')?.value));
    const discountPrice = Math.round(100 * dealPrice/parseInt(this.subDealForm.get('originalPrice')?.value));
    this.subDealForm.get('discountPercentage')?.setValue(discountPrice);
    this.subDeals.push(this.subDealForm.value);
  }

  deleteDeal(i:any) {
    this.subDeals.splice(i, 1)
  }

  initSubDealForm() {
    this.subDealForm = this.fb.group({
      originalPrice: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(5)
        ]),
      ],
      dealPrice: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(5)
        ]),
      ],
      details: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(14),
          Validators.maxLength(200),
          Validators.pattern('^[ a-zA-Z][a-zA-Z ]*$')
        ]),
      ],
      numberOfVouchers: [
        '',
        Validators.compose([
          Validators.required,
          Validators.maxLength(5)
        ])
      ],
      subTitle: [
        '',
          Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(60),
            Validators.pattern('^[a-zA-Z \-\']+')
          ]),
        ],
        discountPercentage: [
          0
        ]
    }, {
      validator: GreaterThanValidator('originalPrice', 'dealPrice')
    });

    const formChangesSubscr = this.subDealForm.valueChanges.subscribe((val) => {
      const updatedData = {...[this.data], ...val}
      this.updateParentModel(updatedData, true);
      this.isCurrentFormValid$.next(this.checkForm());
      this.connection.sendData(updatedData);
      console.log(updatedData)
    });
    this.unsubscribe.push(formChangesSubscr);
  }

  checkForm() {
    return !(
      this.subDealForm.get('originalPrice')?.hasError('required') ||
      this.subDealForm.get('dealPrice')?.hasError('required') ||
      this.subDealForm.get('details')?.hasError('required') ||
      this.subDealForm.get('details')?.hasError('minlength') ||
      this.subDealForm.get('subTitle')?.hasError('required')
    );
  }

  handleMinus() {
    if(this.subDealForm.controls['numberOfVouchers'].value >= 1) {
      this.subDealForm.patchValue({
        numberOfVouchers: this.subDealForm.controls['numberOfVouchers'].value - 1
      });
    }
  }

  handlePlus() {
    this.subDealForm.patchValue({
      numberOfVouchers: this.subDealForm.controls['numberOfVouchers'].value + 1
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
    this.reciever.unsubscribe();
  }
}
