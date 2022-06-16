import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { Subscription } from 'rxjs';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
import { ModalConfig } from './../../../../@core/models/modal.config';
import { AuthService } from './../../../auth/services/auth.service';
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

  @Output() nextClick = new EventEmitter();
  @Output() prevClick = new EventEmitter();
  addVoucher = true;
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
    // details: [
    //   '',
    //   Validators.compose([
    //   Validators.required,
    //   Validators.minLength(16)
    //   ]),
    // ],
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
  data: MainDeal;
  address: string | any;

  @Input() deal: Partial<MainDeal>

  subDeals: any[] = [];

  @Input() mainDeal: Partial<MainDeal>
  @Input() images: any;

  public discount: number;

  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private connection: ConnectionService,
    private toast: HotToastService,
    private authService: AuthService
    ) {
    this.reciever = this.connection.getData().subscribe((response: MainDeal) => {
      this.data = response;
      this.subDeals = this.data.vouchers ? this.data.vouchers  : [] ;
      if(this.subDeals.length > 0) {
        this.addVoucher = false;
      }
    })
  }

  ngOnInit() {
    this.address = this.authService.currentUserValue?.streetAddress
    this.updateParentModel({}, true);
  }

  get voucherFormControl() {
    return this.vouchers.controls;
  }

  updateValue() {
    const formChangesSubscr = this.vouchers.valueChanges.subscribe((val: MainDeal) => {
      this.updateParentModel(val, this.checkForm());
    });
    this.unsubscribe.push(formChangesSubscr);
  }

  checkForm() {
    return !(
      this.vouchers.valid
    )
  }

  async edit(index:any) {
    this.editIndex = index;
    this.vouchers.patchValue(this.subDeals[index]);
    await this.modal.open();
  }

  calculateDiscount() {
    if(this.voucherFormControl['numberOfVouchers'].value > 0) {
      const dealPrice = Math.round(parseInt(this.voucherFormControl['originalPrice']?.value) - parseInt(this.voucherFormControl['dealPrice']?.value));
      const discountPrice = Math.round(100 * dealPrice/parseInt(this.voucherFormControl['originalPrice']?.value));
      this.voucherFormControl['discountPercentage']?.setValue(discountPrice);
      if(this.editIndex >= 0) {
        this.subDeals[this.editIndex] = this.vouchers.value;
      } else {
        this.subDeals.push(this.vouchers.value);
        console.log('subDeals:',this.subDeals);
      }
      this.data.vouchers = this.subDeals;
      this.connection.sendData(this.data);
      this.closeModal();
      this.vouchers.reset();
      this.addVoucher = false;
    }
    else {
      this.voucherFormControl['numberOfVouchers'].setValue(0);
      this.toast.error('Please select at least one voucher', {
        style: {
          border: '1px solid #713200',
          padding: '16px',
          color: '#713200',
        },
        iconTheme: {
          primary: '#713200',
          secondary: '#FFFAEE',
        }
      })
    }
    return;
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

  addMoreVoucher(){
    this.addVoucher = true;
  }

  cancleVoucher() {
    this.addVoucher = false;
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.reciever.unsubscribe();
  }
}
