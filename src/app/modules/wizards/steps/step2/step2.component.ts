import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  subDealForm: FormGroup = this.fb.group({
    vouchers: this.fb.array([])
  });

  reciever: Subscription;
  data: MainDeal

  @Input() deal: Partial<MainDeal>

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
    this.updateParentModel({}, true);
  }

  get f() {
    return this.vouchers.controls;
  }

  calculateDiscount() {
    const dealPrice = Math.round(parseInt(this.vouchers.controls[0].get('originalPrice')?.value) - parseInt(this.vouchers.controls[0].get('dealPrice')?.value));
    const discountPrice = Math.round(100 * dealPrice/parseInt(this.vouchers.controls[0].get('originalPrice')?.value));
    this.vouchers.controls[0].get('discountPercentage')?.setValue(discountPrice);
    this.subDeals.push(this.vouchers.value);
    this.vouchers.removeAt(1);
    this.vouchers.reset();
  }

  deleteDeal(i:any) {
    this.subDeals.splice(i, 1);
    this.vouchers.removeAt(i);
  }

  get vouchers() {
    return this.subDealForm.controls['vouchers'] as FormArray
  }

  addVoucher() {
    const voucherFormGroup = this.fb.group({
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
      0,
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
    })
    this.vouchers.push(voucherFormGroup);
    const formChangesSubscr = this.subDealForm.valueChanges.subscribe((val) => {
      const updatedVal = {...this.data, ...val}
      this.updateParentModel(updatedVal, true);
      this.isCurrentFormValid$.next(this.checkForm());
      this.connection.sendData(updatedVal);
      console.log(updatedVal)
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
    if(this.vouchers.controls[0].get('numberOfVouchers')?.value >= 1) {
      this.vouchers.controls[0].patchValue({
        numberOfVouchers: this.vouchers.controls[0].get('numberOfVouchers')?.value - 1
      });
    }
  }

  handlePlus() {
    this.vouchers.controls[0].patchValue({
      numberOfVouchers: this.vouchers.controls[0].get('numberOfVouchers')?.value + 1
    })
  }

  async openNew() {
    this.addVoucher();
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
