import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
import { ModalConfig } from './../../../../@core/models/modal.config';
import { GreaterThanValidator } from './../../greater-than.validator';
import { MainDeal } from './../../models/main-deal.model';
import { ConnectionService } from './../../services/connection.service';
;

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss'],
})
export class Step2Component implements OnInit, OnDestroy {

  editIndex:number = -1;
  vouchers = this.fb.group({
    originalPrice: [
      60,
      Validators.compose([
      Validators.required,
      ]),
    ],
    dealPrice: [
      50,
      Validators.compose([
      Validators.required,
      ]),
    ],
    details: [
      '',
      Validators.compose([
      Validators.required,
      Validators.minLength(16)
      ]),
    ],
    numberOfVouchers: [
      0,
      Validators.compose([
      Validators.required,
      ])
    ],
    subTitle: [
      '',
      Validators.compose([
      Validators.required,
      Validators.minLength(3),
      Validators.pattern('^[a-zA-Z \-\']+')
        ]),
      ],
    discountPercentage: [
      0
    ]
    }, {
      validator: GreaterThanValidator('originalPrice', 'dealPrice')
    })

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

  reciever: Subscription;
  data: MainDeal

  @Input() deal: Partial<MainDeal>

  subDeals: any[] = [];

  @Input() mainDeal: Partial<MainDeal>
  @Input() images: any;

  public discount: number;

  private unsubscribe: Subscription[] = [];

  constructor(private fb: FormBuilder, private connection: ConnectionService) {
    this.reciever = this.connection.getData().subscribe((response: MainDeal) => {
      this.data = response;
      this.subDeals = this.data.vouchers ? this.data.vouchers  : [] ;
    })
  }

  ngOnInit() {
    this.updateParentModel({}, true);
  }

  get voucherFormControl() {
    return this.vouchers.controls;
  }

  async edit(index:any) {
    this.editIndex = index;
    this.vouchers.patchValue(this.subDeals[index]);
    await this.modal.open();
  }

  calculateDiscount() {
    const dealPrice = Math.round(parseInt(this.voucherFormControl['originalPrice']?.value) - parseInt(this.voucherFormControl['dealPrice']?.value));
    const discountPrice = Math.round(100 * dealPrice/parseInt(this.voucherFormControl['originalPrice']?.value));
    this.voucherFormControl['discountPercentage']?.setValue(discountPrice);
    if(this.editIndex >= 0) {
      this.subDeals[this.editIndex] = this.vouchers.value;
    } else {
      this.subDeals.push(this.vouchers.value);
    }
    this.data.vouchers = this.subDeals;
    this.connection.sendData(this.data);
    this.vouchers.reset();
  }

  deleteDeal(i:any) {
    this.subDeals.splice(i, 1);
    this.data.vouchers = this.subDeals;
    this.connection.sendData(this.data);
    // this.vouchers.removeAt(i);
  }

  handleMinus() {
    const numOfVoucher = this.voucherFormControl['numberOfVouchers'].value;
    if(numOfVoucher > 0)
      this.voucherFormControl['numberOfVouchers'].patchValue(numOfVoucher-1);
  }

  handlePlus() {
    const numOfVoucher = this.voucherFormControl['numberOfVouchers'].value;
    this.voucherFormControl['numberOfVouchers'].patchValue(numOfVoucher+1);
  }

  async openNew() {
    this.vouchers.reset()
    this.editIndex = -1;
    return await this.modal.open(null,'voucher-modal');
  }

  async closeModal() {
    return await this.modal.close();
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.reciever.unsubscribe();
  }
}
