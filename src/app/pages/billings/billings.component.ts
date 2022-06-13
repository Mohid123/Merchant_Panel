import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReusableModalComponent } from '@components/reusable-modal/reusable-modal/reusable-modal.component';
import { ModalConfig } from '@core/models/modal.config';
import { ApiResponse } from '@core/models/response.model';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { BillingsService } from '@pages/services/billings.service';
import { Subject } from 'rxjs';
import { exhaustMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { BillingList } from 'src/app/modules/wizards/models/billing-list.model';
import { KYC } from 'src/app/modules/wizards/models/kyc.model';
import { MerchantStats } from './../../modules/wizards/models/merchant-stats.model';

@Component({
  selector: 'app-billings',
  templateUrl: './billings.component.html',
  styleUrls: ['./billings.component.scss']
})
export class BillingsComponent implements OnInit, OnDestroy {

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

  public billingsData: BillingList | any;
  showData: boolean;
  page: number;
  offset: number = 0;
  limit: number = 7;
  destroy$ = new Subject();
  hoveredDate: NgbDate | any = null;
  fromDate: NgbDate | any;
  toDate: NgbDate | any = null;
  invoiceDate: string;
  invoiceAmount: string;
  status: string;
  kycForm: FormGroup;
  statsLoading: boolean;
  billingStats: MerchantStats;
  statusTypes = [
    {
      status: 'Paid'
    },
    {
      status: 'UnPaid'
    },
    {
      status: 'Pending'
    },
    {
      status: 'Cancelled'
    }
  ];

  constructor(
    private billingService: BillingsService,
    private cf: ChangeDetectorRef,
    private authService: AuthService,
    private fb: FormBuilder,
    private calendar: NgbCalendar,
    private toast: HotToastService,
    private userService: UserService
    ) {
      this.page = 1;
      this.fromDate = '';
      this.toDate = '';
    }

  ngOnInit(): void {
    this.getMerchantStats();
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
      ],
      // vatNumber: [
      //   '',
      //   Validators.compose([
      //     Validators.required
      //   ])
      // ]
    })
  }

  completeKYC() {
    const payload: KYC = {
      iban: this.kycForm.value.iban,
      bankName: this.kycForm.value.bankName,
      // vatNumber: this.kycForm.value.vatNumber
    }
    this.billingService.completeKYC(this.authService.currentUserValue?.id, payload)
    .pipe(takeUntil(this.destroy$), exhaustMap((res: any) => {
      if(!res.hasErrors()) {
        this.toast.success('KYC Submitted Successfully', {
          style: {
            border: '1px solid #65a30d',
            padding: '16px',
            color: '#3f6212',
          },
          iconTheme: {
            primary: '#84cc16',
            secondary: '#064e3b',
          },
        })
        return this.userService.getUser();
      }
      else {
        this.toast.error('Failed to submit KYC', {
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
        return (res);
      }
    }))
    .subscribe()
  }

  getMerchantStats() {
    this.statsLoading = false;
    this.billingService.getMerchantStats(this.authService.currentUserValue?.id)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<MerchantStats>) => {
      if(!res.hasErrors()) {
        this.billingStats = res.data;
        this.statsLoading = true;
        this.cf.detectChanges();
      }
    })
  }

  getInvoicesByMerchant() {
    this.showData = false;
    const params: any = {
      invoiceDate: this.invoiceDate,
      invoiceAmount: this.invoiceAmount,
      dateFrom: new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day).getTime(),
      dateTo: new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day).getTime(),
      status: this.status
    }
    this.billingService.getAllInvoicesByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res:ApiResponse<BillingList>) => {
      debugger
      if(!res.hasErrors()) {
        this.billingsData = res.data;
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }

  filterByInvoiceDate(invoiceDate: string) {
    this.offset = 0;
    if(this.invoiceDate == '' || this.invoiceDate == 'Descending') {
      this.invoiceDate = 'Ascending'
    }
    else {
      this.invoiceDate = invoiceDate;
    }
    this.getInvoicesByMerchant();
  }

  filterByInvoiceAmount(invoiceAmount: string) {
    this.offset = 0;
    if(this.invoiceAmount == '' || this.invoiceAmount == 'Descending') {
      this.invoiceAmount = 'Ascending'
    }
    else {
      this.invoiceAmount = invoiceAmount;
    }
    this.getInvoicesByMerchant();
  }

  filterByDate(startDate: number, endDate: number) {
    this.offset = 0;
    this.fromDate = startDate;
    this.toDate = endDate;
    this.getInvoicesByMerchant();
  }

  filterByStatus(status: string) {
    debugger
    this.offset = 0;
    this.status = status;
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
    return await this.modal.close().then(() => {
      this.kycForm.reset();
    });
  }

  next():void {
    this.page++;
    this.getInvoicesByMerchant();
  }

  previous():void {
    this.page--;
    this.getInvoicesByMerchant();
  }

  resetFilters() {
    this.offset = 0;
    this.fromDate = '';
    this.toDate = '';
    this.invoiceAmount = 'Ascending';
    this.invoiceDate = 'Ascending';
    this.status = '';
    this.getInvoicesByMerchant();
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }


}
