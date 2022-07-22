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
import { Billings } from './../../modules/wizards/models/billings.model';
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
  invoiceID: string = '';
  invoiceIDsFilter : any;
  filteredResult: any;
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
  appliedFilter: any;
  dateAppliedFilter: any;
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
      accountHolder: [
        '',
        Validators.compose([
          Validators.required
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
    const params: any = {}
    const dateFrom:any =  new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day).getTime() ? new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day).getTime(): '';
    const dateTo:any = new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day).getTime() ? new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day).getTime() : '';
    this.billingService.getAllInvoicesByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.invoiceID, dateFrom, dateTo, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res:ApiResponse<BillingList>) => {
      if(!res.hasErrors()) {
        this.billingsData = res.data;
        console.log(this.billingsData)
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }

  isFilterApplied(fiilterApplied: any) {
    this.appliedFilter = fiilterApplied;
  }

  applyFilter() {
    this.showData = false;
    const params: any = {
      invoiceIDsArray: this.invoiceIDsFilter?.filterData ? this.invoiceIDsFilter?.filterData : []
    }
    this.billingService.getAllInvoicesByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, '', '', '', params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res:ApiResponse<BillingList>) => {
      if(!res.hasErrors()) {
        this.billingsData = res.data;
        console.log(this.billingsData)
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }

  filterByInvoiceID(invoiceID: string) {
    this.offset = 0;
    this.invoiceID = invoiceID;
    const params: any = {};
    if(this.invoiceID != '') {
      this.billingService.getAllInvoicesByMerchantID(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.invoiceID, this.fromDate, this.toDate, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.cf.detectChanges();
          this.filteredResult = res.data.data.map((filtered: Billings) => {
            return {
              id: filtered.id,
              value: filtered.invoiceID,
              checked: false
            }
          })
          this.cf.detectChanges();
        }
      })
    } else {
      this.filteredResult.length = 0;
    }

  }

  filterSelectedInvoiceByID(options: any) {
    this.showData = false;
    this.invoiceIDsFilter = options;
    this.applyFilter()
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
    this.dateAppliedFilter = true;
    this.getInvoicesByMerchant();
  }

  filterByStatus(status: string) {
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

  clear() {
    this.fromDate = '';
    this.toDate = '';
    this.dateAppliedFilter = false;
    this.applyFilter();
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
    this.page;
    this.getInvoicesByMerchant();
  }

  resetFilters() {
    this.limit = 7;
    this.appliedFilter = false;
    this.dateAppliedFilter = false;
    this.invoiceIDsFilter = [];
    this.invoiceID = '';
    this.fromDate = '';
    this.toDate = '';
    this.getInvoicesByMerchant();
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
