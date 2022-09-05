import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiResponse } from '@core/models/response.model';
import { DealService } from '@core/services/deal.service';
import { HotToastService } from '@ngneat/hot-toast';
import { CommonFunctionsService } from '@pages/services/common-functions.service';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReusableModalComponent } from 'src/app/_metronic/layout/components/reusable-modal/reusable-modal.component';
import { ModalConfig } from './../../../../@core/models/modal.config';
import { AuthService } from './../../../auth/services/auth.service';
import { GreaterThanValidator } from './../../greater-than.validator';
import { MainDeal } from './../../models/main-deal.model';
import { Vouchers } from './../../models/vouchers.model';
import { ConnectionService } from './../../services/connection.service';
;

@Component({
  selector: 'app-step2',
  templateUrl: './step2.component.html',
  styleUrls: ['./step2.component.scss'],
})
export class Step2Component implements OnInit, OnDestroy {

  removed: boolean = false;
  id: string;
  editID: string;

  @Output() nextClick = new EventEmitter();
  @Output() prevClick = new EventEmitter();
  addVoucher = true;
  editIndex:number = -1;

  selectedIndex: any;

  @ViewChild('modal') private modal: ReusableModalComponent;
  @ViewChild('modal2') private modal2: ReusableModalComponent;

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
  dataReciever: Subscription
  data: MainDeal;
  newData: MainDeal;
  editData: MainDeal;
  address: string | any;
  destroy$ = new Subject();
  singleVoucher: Vouchers;
  vouchers: FormGroup;
  editVouchers: FormGroup;
  saveEditDeal: boolean;
  voucherStartDate: any;
  voucherEndDate: any;
  voucherValidity: any;

  @Input() deal: Partial<MainDeal>

  subDeals: any[] = [];
  vouchersForEdit: any

  @Input() mainDeal: Partial<MainDeal>
  @Input() images: any;

  public discount: number;

  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    public connection: ConnectionService,
    private toast: HotToastService,
    private authService: AuthService,
    private dealService: DealService,
    private common: CommonFunctionsService,
    private cf: ChangeDetectorRef
    ) {

    this.reciever = this.connection.getData().subscribe((response: MainDeal) => {
      this.data = response;
      // this.subDeals = this.data.subDeals ? this.data.subDeals : [];
      if(this.subDeals.length > 0) {
        this.addVoucher = false;
      }
    });

    this.dataReciever = this.connection.getSaveAndNext().subscribe((response: MainDeal) => {
      this.newData = response;
      this.id = response?.id;

      if(response.subDeals?.length > 0) {
        this.data.subDeals = response.subDeals;
        this.subDeals = this.data.subDeals ? this.data.subDeals : [];
        this.newData.subDeals = this.data.subDeals ? this.data.subDeals : [];
        if(this.subDeals.length > 0) {
          this.addVoucher = false;
        }
        this.connection.sendData(this.data);
      }
    });

    this.saveEditDeal = false;
  }

  ngOnInit() {
    this.initVouchers();
    this.initEditVouchers();
    this.address = this.authService.currentUserValue?.streetAddress;
    this.updateParentModel({}, true);
    this.editDealData();
  }

  editDealData() {
    this.connection.getStep1().subscribe((res: any) => {
      if((res.dealStatus == 'Draft' || res.dealStatus == 'Needs attention') && res.id) {
        this.editID = res.id;
        this.subDeals = res.subDeals;
        this.voucherStartDate = res.subDeals[0]?.voucherStartDate ? res.subDeals[0]?.voucherStartDate : '';
        this.voucherEndDate = res.subDeals[0]?.voucherEndDate ? res.subDeals[0]?.voucherEndDate : '';
        this.voucherValidity = res.subDeals[0]?.voucherValidity ? res.subDeals[0]?.voucherValidity : '';
        if(this.subDeals.length > 0) {
          this.addVoucher = false;
          this.saveEditDeal = true;
        }
        this.editData = res;
        this.cf.detectChanges();
      }
    })
  }

  initVouchers() {
    this.vouchers = this.fb.group({
      originalPrice: [
        '',
        Validators.compose([
        Validators.required,
        ]),
      ],
      dealPrice: [
        ''
      ],
      numberOfVouchers: [
       '0',
        Validators.compose([
        Validators.required,
        Validators.min(1)
        ])
      ],
      title: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9.,-:èë ]+')
        ])
      ],
      discountPercentage: [
        0
      ]
      }, {
        validator: GreaterThanValidator('originalPrice', 'dealPrice')
    });
  }

  initEditVouchers() {
    this.editVouchers = this.fb.group({
      originalPrice: [
        '',
        Validators.compose([
        Validators.required,
        ]),
      ],
      dealPrice: [
        ''
      ],
      numberOfVouchers: [
        '0',
        Validators.compose([
        Validators.required,
        Validators.min(1)
        ])
      ],
      title: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9.,-:èë ]+')
        ])
      ],
      discountPercentage: [
        0
      ]
      }, {
        validator: GreaterThanValidator('originalPrice', 'dealPrice')
    })
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
    this.editVouchers.patchValue(this.subDeals[index]);
    await this.modal.open();
  }

  editVoucher() {
    if(this.editVouchers.invalid) {
      this.editVouchers.markAllAsTouched();
      return;
    }
    if(parseInt(this.editVouchers.controls['dealPrice']?.value) >= 0) {
      if(parseInt(this.editVouchers.controls['dealPrice']?.value) == 0 && parseInt(this.editVouchers.controls['originalPrice']?.value) == 0) {

        this.editVouchers.controls['discountPercentage']?.setValue('0');
      }
      else {
        const dealPrice = Math.round(parseInt(this.editVouchers.controls['originalPrice']?.value) - parseInt(this.editVouchers.controls['dealPrice']?.value));
        const discountPrice = Math.floor(100 * dealPrice/parseInt(this.editVouchers.controls['originalPrice']?.value));
        this.editVouchers.controls['discountPercentage']?.setValue(discountPrice);
      }
    }
    else if(!parseInt(this.editVouchers.controls['dealPrice']?.value)) {
      const discountPrice = 100;
      this.editVouchers.controls['discountPercentage']?.setValue(discountPrice);
    }
    else {
      this.editVouchers.controls['dealPrice']?.setValue('0');
      const dealPrice = Math.round(parseInt(this.editVouchers.controls['originalPrice']?.value) - parseInt(this.editVouchers.controls['dealPrice']?.value));
      const discountPrice = Math.floor(100 * dealPrice/parseInt(this.editVouchers.controls['originalPrice']?.value));
      this.editVouchers.controls['discountPercentage']?.setValue(discountPrice);
    }
    if(this.editIndex >= 0) {
      this.subDeals[this.editIndex] = this.editVouchers.value;
    } else {
      this.subDeals.push(this.editVouchers.value);
    }
    this.data.subDeals = this.subDeals;
    this.newData.subDeals = this.subDeals;

    this.connection.sendData(this.data);
    if(this.editID) {
      this.saveEditDeal = true;
    }
    this.closeModal();
    this.editVouchers.reset();
    this.addVoucher = false;
  }

  calculateDiscount() {
    if(this.vouchers.invalid) {
      this.vouchers.markAllAsTouched();
      return;
    }
    if (parseInt(this.vouchers.controls['dealPrice']?.value) >= 0) {

      if(parseInt(this.vouchers.controls['dealPrice']?.value) == 0 && parseInt(this.vouchers.controls['originalPrice']?.value) == 0) {
        this.vouchers.controls['discountPercentage']?.setValue('0');
      }
      else {
        const dealPrice = Math.round(parseInt(this.voucherFormControl['originalPrice']?.value) - parseInt(this.voucherFormControl['dealPrice']?.value));
        const discountPrice = Math.floor(100 * dealPrice/parseInt(this.voucherFormControl['originalPrice']?.value));
        this.vouchers.controls['discountPercentage']?.setValue(discountPrice);
      }
    }
    else if(!parseInt(this.vouchers.controls['dealPrice']?.value)) {
      const discountPrice = 100;
      this.vouchers.controls['discountPercentage']?.setValue(discountPrice);
    }
    else {
      this.vouchers.controls['dealPrice']?.setValue('0');
      const dealPrice = Math.round(parseInt(this.voucherFormControl['originalPrice']?.value) - parseInt(this.voucherFormControl['dealPrice']?.value));
      const discountPrice = Math.floor(100 * dealPrice/parseInt(this.voucherFormControl['originalPrice']?.value));
      this.vouchers.controls['discountPercentage']?.setValue(discountPrice);
    }
    if(this.editIndex >= 0) {
      this.subDeals[this.editIndex] = this.vouchers.value;
    } else {
      this.subDeals.push(this.vouchers.value);
    }
    this.data.subDeals = this.subDeals;

    this.newData.subDeals = this.subDeals;
    this.connection.sendData(this.data);
    if(this.editID) {
      this.saveEditDeal = true;
    }
    this.closeModal();
    this.vouchers.reset();
    this.vouchers.get('numberOfVouchers')?.setValue('0');
    this.removed = true;
    //this.addVoucher = false;
  }

  deleteDeal() {
    this.subDeals.splice(this.selectedIndex, 1);
    this.data.subDeals = this.subDeals;
    if(this.newData) {
      this.newData.subDeals = this.subDeals;
    }
    if(this.editData) {
      this.editData.subDeals = this.subDeals;
    }
    this.connection.sendData(this.data);
    if(this.subDeals.length == 0) {
      this.addVoucher = true;
      this.saveEditDeal = false;
      this.initVouchers();
      this.editIndex = -1;
    }
    this.modal2.close();
  }

  async showDeletePopoup(index: any) {
    this.selectedIndex = index;
    return await this.modal2.open();
  }

  async closeSecondModal() {
    return await this.modal2.close();
  }

  editHandlePlus() {
    this.editVouchers.patchValue({
      numberOfVouchers: parseInt(this.editVouchers.get('numberOfVouchers')?.value) + 1
    });
  }

  editHandleMinus() {
    if(this.editVouchers.controls['numberOfVouchers'].value >= 1) {
      this.editVouchers.patchValue({
        numberOfVouchers: parseInt(this.editVouchers.get('numberOfVouchers')?.value) - 1
      });
    }
  }

  handleMinus() {
    if(this.vouchers.controls['numberOfVouchers'].value >= 1) {
      this.vouchers.patchValue({
        numberOfVouchers: parseInt(this.vouchers.get('numberOfVouchers')?.value) - 1
      });
    }
  }

  handlePlus() {
    this.vouchers.patchValue({
      numberOfVouchers: parseInt(this.vouchers.get('numberOfVouchers')?.value) + 1
    });
  }

  async openNew() {
    this.vouchers.reset()
    this.editIndex = -1;
    return await this.modal.open(null,'voucher-modal');
  }

  async closeModal() {
    return await this.modal.close();
  }

  addMoreVoucher() {
    this.vouchers.reset();
    this.vouchers.get('numberOfVouchers')?.setValue('0');
    this.addVoucher = true;
    this.editIndex = -1;
  }

  cancleVoucher() {
    this.addVoucher = false;
  }

  async saveSecondDraft() {
    switch (this.saveEditDeal) {
      case true:
        this.connection.isSaving.next(true);
        this.nextClick.emit('');
        this.editData.pageNumber = 2;
        this.editData.subDeals = this.subDeals;
        this.editData.subDeals.forEach((voucher) => {
          voucher.voucherStartDate = this.voucherStartDate;
          voucher.voucherEndDate = this.voucherEndDate;
          voucher.voucherValidity = this.voucherValidity
        })

        const payload = this.editData;
        if(payload) {
          return this.dealService.createDeal(payload)
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: ApiResponse<any>) => {
            if(!res.hasErrors()) {
              this.connection.isSaving.next(false);
              this.connection.sendSaveAndNext(res.data);
            }
          })
        }
      break;
      case false:
        this.connection.isSaving.next(true);
        this.nextClick.emit('');
        this.newData.pageNumber = 2;

        const newPayload = this.newData;

        if(newPayload) {
          return this.dealService.createDeal(newPayload)
          .pipe(takeUntil(this.destroy$))
          .subscribe((res: ApiResponse<any>) => {
            if(!res.hasErrors()) {
              this.connection.isSaving.next(false);
              this.connection.sendSaveAndNext(res.data);
              // this.connection.sendStep1(res.data)
            }
          })
        }
      }
  }

  returnToPrevious() {
    this.prevClick.emit('');
    // this.common.deleteDealByID(this.id);
  }

  convertToInteger(value: any) {
    return parseInt(value);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.reciever.unsubscribe();
    this.dataReciever.unsubscribe();
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }
}
