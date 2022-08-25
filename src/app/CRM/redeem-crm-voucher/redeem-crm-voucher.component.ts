import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OrdersService } from '@pages/services/orders.service';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Orders } from './../../modules/wizards/models/order.model';
import { ConnectionService } from './../../modules/wizards/services/connection.service';

@Component({
  selector: 'app-redeem-crm-voucher',
  templateUrl: './redeem-crm-voucher.component.html',
  styleUrls: ['./redeem-crm-voucher.component.scss']
})
export class RedeemCrmVoucherComponent implements OnInit, AfterViewInit {

  singleVoucher: Observable<Orders | any>;
  @ViewChild('modal') private modal: TemplateRef<any>;
  pinForm: FormGroup;
  voucherID: string;
  destroy$ = new Subject();
  voucherIDForQuery: string;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private activatedRoute : ActivatedRoute,
    private orderService: OrdersService,
    private conn: ConnectionService) { }

  ngOnInit(): void {
    this.initPinCodeForm();
    this.voucherID = this.activatedRoute.snapshot.params['voucherId'];
    if(this.voucherID) {
      this.getVoucherByMongoID();
    }
  }

  ngAfterViewInit() {
    this.openModal();
  }

  getVoucherByMongoID() {
    this.orderService.getVoucherByMongoID(this.voucherID).pipe(takeUntil(this.destroy$)).subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.voucherIDForQuery = res.data?.voucherID;
        this.singleVoucher = of(res.data);
      }
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
    })
  }

  async openModal() {
    // this.singleVoucher = ;
    return this.modalService.open(this.modal, {
      centered: true,
      size: 'md',
      backdrop: 'static',
      keyboard: false,
    });
  }

  async closeModal() {
    return this.modalService.dismissAll();
  }

}
