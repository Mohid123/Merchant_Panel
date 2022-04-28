import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReusableModalComponent } from '@components/reusable-modal/reusable-modal/reusable-modal.component';
import { ModalConfig } from '@core/models/modal.config';
import { ApiResponse } from '@core/models/response.model';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { BillingsService } from '@pages/services/billings.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { BillingList } from 'src/app/modules/wizards/models/billing-list.model';
import { KYC } from 'src/app/modules/wizards/models/kyc.model';

@Component({
  selector: 'app-billings',
  templateUrl: './billings.component.html',
  styleUrls: ['./billings.component.scss']
})
export class BillingsComponent implements OnInit {

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

  public billingsData: BillingList;
  showData: boolean;
  offset: number = 0;
  limit: number = 10;
  destroy$ = new Subject();
  hoveredDate: NgbDate | any = null;
  fromDate: NgbDate | any;
  toDate: NgbDate | any = null;
  invoiceDate: string;
  invoiceAmount: string;
  kycForm: FormGroup;

  constructor(
    private billingService: BillingsService,
    private cf: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder,
    calendar: NgbCalendar
    ) {
      this.fromDate = calendar.getToday();
      this.toDate = calendar.getNext(calendar.getToday(), 'd', 0);
    }

  ngOnInit(): void {
    this.authService.retreiveUserValue()
    this.getInvoicesByMerchant();
    this.initKYCForm();
  }

  get f() {
    return this.kycForm.controls;
  }

  initKYCForm() {
    this.kycForm = this.fb.group({
      iban: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(15),
          Validators.maxLength(35)
        ])
      ],
      bankName: [
        '',
        Validators.compose([
          Validators.required
        ])
      ]
    })
  }

  completeKYC() {
    const payload: KYC = {
      iban: this.kycForm.value.iban,
      bankName: this.kycForm.value.bankName
    }
    this.billingService.completeKYC(payload)
    .pipe((takeUntil(this.destroy$)))
    .subscribe((res:ApiResponse<KYC>) => {
      if(!res.hasErrors()) {
        alert('Success'); // will replace with toast
      }
      else {
        alert('Failed')
      }
    })
  }

  getInvoicesByMerchant() {
    this.showData = false;
    const params: any = {
      invoiceDate: this.invoiceDate,
      invoiceAmount: this.invoiceAmount,
      dateFrom: new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day).getTime(),
      dateTo: new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day).getTime()
    }
    debugger
    this.billingService.getAllInvoicesByMerchantID(this.authService.merchantID, this.offset, this.limit, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res:ApiResponse<BillingList>) => {
      debugger
      if(!res.hasErrors()) {
        this.billingsData = res.data;
        this.cf.detectChanges();
        this.showData = true;
      }
    })
  }

  filterByInvoiceDate(invoiceDate: string) {
    debugger
    this.offset = 0;
    this.invoiceDate = invoiceDate;
    this.getInvoicesByMerchant();
  }

  filterByInvoiceAmount(invoiceAmount: string) {
    debugger
    this.offset = 0;
    this.invoiceAmount = invoiceAmount;
    this.getInvoicesByMerchant();
  }

  filterByDate(startDate: number, endDate: number) {
    this.offset = 0;
    this.fromDate = startDate;
    this.toDate = endDate;
    this.getInvoicesByMerchant();
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  async openModal() {
    return await this.modal.open();
  }

  async closeModal() {
    return await this.modal.close();
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }


}
