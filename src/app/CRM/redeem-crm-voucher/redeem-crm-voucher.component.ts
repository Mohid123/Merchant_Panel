import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { OrdersService } from '@pages/services/orders.service';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Orders } from './../../modules/wizards/models/order.model';
import { ConnectionService } from './../../modules/wizards/services/connection.service';

@Component({
  selector: 'app-redeem-crm-voucher',
  templateUrl: './redeem-crm-voucher.component.html',
  styleUrls: ['./redeem-crm-voucher.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RedeemCrmVoucherComponent implements OnInit, AfterViewInit {

  singleVoucher: Observable<Orders | any>;
  @ViewChild('modal') private modal: TemplateRef<any>;
  pinForm: FormGroup;
  voucherID: string;
  destroy$ = new Subject();
  voucherIDForQuery: string;
  condition: string;
  modalDialogClass: string = '';
  isLoading: boolean = false;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private activatedRoute : ActivatedRoute,
    private orderService: OrdersService,
    private conn: ConnectionService,
    private toast: HotToastService) {}

  ngOnInit(): void {
    this.initPinCodeForm();
    this.voucherID = this.activatedRoute.snapshot.params['voucherId'];
    if(this.voucherID) {
      this.getVoucherByMongoID().then(() => {
        this.openModal();
      });
    }
  }

  ngAfterViewInit() {
    // this.openModal();
  }

  async getVoucherByMongoID() {
    return new Promise((resolve, reject) => {
      this.isLoading = true;
      this.orderService.getVoucherByMongoID(this.voucherID).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.voucherIDForQuery = res.data?.voucherID;
          console.log(res.data)
          this.singleVoucher = of(res.data);
          resolve('success');
          this.isLoading = false;
        }
        else {
          reject('error')
        }
      })
    })
  }

  onDigitInput(event: any){
    let element;
    if (event.code !== 'Backspace')
        element = event.srcElement.nextElementSibling;
     if (event.code === 'Backspace')
        element = event.srcElement.previousElementSibling;
     if(element == null)
        return;
     else
      element.focus();
  }

  initPinCodeForm() {
    this.pinForm = this.fb.group({
      firstValue: new FormControl('', Validators.maxLength(1)),
      secondValue: new FormControl('', Validators.maxLength(1)),
      thirdValue: new FormControl('', Validators.maxLength(1)),
      fourthValue: new FormControl('', Validators.maxLength(1)),
    })
  }

  redeemVocuherbyPin() {
    const pinFormValue = [this.pinForm.value];
    const pinCode = Object.values(pinFormValue).map((value: any) => {
      const values = [value.firstValue, value.secondValue, value.thirdValue, value.fourthValue].join('')
      return values
    });
    const payload = {
      voucherID: this.voucherIDForQuery,
      pin: pinCode[0]
    }
    this.orderService.redeemVoucherByPinCode(payload).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        if(res.data.status == 'success') {
          this.pinForm.reset();
          this.singleVoucher = of(res.data.voucher)
        }
      }
      else {
        this.toast.error(res.errors[0].error.message)
      }
    })
  }

  async openModal() {
    return this.modalService.open(this.modal, {
      size: 'md',
      backdrop: false,
      keyboard: false,
      modalDialogClass: this.conn.modalDialogClass.value
    });
  }

  async closeModal() {
    return this.modalService.dismissAll();
  }

}
