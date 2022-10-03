import { animate, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalConfig } from '@core/models/modal.config';
import { ApiResponse } from '@core/models/response.model';
import { DealService } from '@core/services/deal.service';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { AnalyticsService } from '@pages/services/analytics.service';
import { NgPasswordValidatorOptions } from 'ng-password-validator';
import { Subject, Subscription } from 'rxjs';
import { exhaustMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { GreaterThanValidator } from 'src/app/modules/wizards/greater-than.validator';
import { CustomValidators } from './../../modules/auth/components/reset-password/custom-validators';
import { PasswordService } from './../../modules/auth/services/password-service';
import { UserService } from './../../modules/auth/services/user.service';
import { ConnectionService } from './../../modules/wizards/services/connection.service';
import { ReusableModalComponent } from './../../_metronic/layout/components/reusable-modal/reusable-modal.component';
import { ConfirmPasswordValidator } from './password-validator';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({transform: 'translateY(-100%)'}),
        animate('225ms ease-in-out', style({transform: 'translateY(0%)'}))
      ]),
      transition(':leave', [
        animate('325ms ease-in-out', style({transform: 'translateY(-100%)', opacity: '0'}))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('modal') private modal: ReusableModalComponent;
  @ViewChild('editModal') private editModal: ReusableModalComponent;
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

  newPassForm: FormGroup;
  showData: boolean;
  destroy$ = new Subject();
  topDeals: any;
  offset: number = 0;
  limit: number = 5;
  reciever: Subscription;
  oldpPass: string;
  validityPass: boolean;
  passwordHide: boolean = true;
  currentEvents: any;
  dealData: any;
  page: number;
  voucherId: string;
  dealIDForEdit: string;
  voucherIndex: any;
  selectedIndex: any;
  editVouchers: FormGroup;

  options: NgPasswordValidatorOptions = {
    placement: "bottom",
    "animation-duration": 500,
    shadow: true,
    "z-index": 1200,
    theme: "pro",
    offset: 8,
    heading: "Password Policy",
    successMessage: "Password is Valid",
    rules: {
      password: {
          type: "range",
          length: 8,
          min: 8,
          max: 100,
      },
      "include-symbol": true,
      "include-number": true,
      "include-lowercase-characters": true,
      "include-uppercase-characters": true,
    }
}


  constructor(
    private dealService: DealService,
    private analytics: AnalyticsService,
    private authService: AuthService,
    private cf: ChangeDetectorRef,
    private fb: FormBuilder,
    private toast: HotToastService,
    private passService: PasswordService,
    private userService: UserService,
    private router: Router,
    private conn: ConnectionService
    ) {
      this.page = 1;
      this.validityPass = false;
      this.userService.getUser().pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngOnInit(): void {
    this.reciever = this.passService.getData().subscribe((response: any) => {
      this.oldpPass = response;
    })
    this.getTopDealsByMerchant();
    this.initPassForm();
    this.initEditVouchers();
  }

  ngAfterViewInit(): void {
    this.checkNewuser();
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
          Validators.pattern(`^[a-zA-Z0-9.,"'-:èëéà ]+`)
        ])
      ],
      discountPercentage: [
        0
      ]
      }, {
        validator: GreaterThanValidator('originalPrice', 'dealPrice')
    })
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

  saveEditVoucherOnListView() {
    const originalPrice = parseFloat(this.editVouchers.get('originalPrice')?.value.toString().replace(',' , '.'));
    const dealPrice = parseFloat(this.editVouchers.get('dealPrice')?.value.toString().replace(',' , '.'));
    const voucher: any = {
      voucherID: this.voucherId,
      title: this.editVouchers.get('title')?.value,
      originalPrice: originalPrice,
      dealPrice: dealPrice,
      numberOfVouchers: parseInt(this.editVouchers.get('numberOfVouchers')?.value)
    }
    this.dealService.updateVoucher(this.dealIDForEdit, {subDeals: voucher})
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.toast.success('Sub deal updated!');
        this.editModal.close().then(() => {
          this.getTopDealsByMerchant();
        });
      }
      else {
        this.toast.error(res.errors[0].error.message);
        this.editModal.close();
      }
    })
  }

  checkNewuser() {
    if(this.authService.currentUserValue?.newUser == true) {
      this.openNew();
    }
    else {
      return;
    }
  }

  get f() {
    return this.newPassForm.controls;
  }

  initPassForm() {
    this.newPassForm = this.fb.group({
      password: [
        '',
        Validators.compose([
          CustomValidators.patternValidator(/\d/, {
            hasNumber: true
          }),
          CustomValidators.patternValidator(/[A-Z]/, {
            hasCapitalCase: true
          }),
          CustomValidators.patternValidator(/[a-z]/, {
            hasSmallCase: true
          }),
          CustomValidators.patternValidator(
            /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
            {
              hasSpecialCharacters: true
            }
          ),
          Validators.minLength(8),
          Validators.required
        ])
      ],
      confirmPass: [
        '',
        Validators.compose([
          Validators.required
        ])
      ]
    }, {
      validator: ConfirmPasswordValidator.MatchPassword
    })
  }

  get passFormControl() {
    return this.newPassForm.controls;
  }

  passwordShowHide(): void {
    this.passwordHide = !this.passwordHide;
  }

  isValid(str: string) {
    const pattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[-+_!@#$%^&*.,?]).+$");
    if (pattern.test(str)) {
      this.validityPass = true;
    }
    else {
      this.validityPass = false;
    }
  }

  openPopover(p: NgbPopover) {
    p.toggle();
  }

  closePopover(close: boolean, p: NgbPopover) {
    if(close == true) {
      p.close();
    }
  }

  resetPassword() {
    const payload: any = {
      password: this.oldpPass,
      newPassword: this.newPassForm.value.password
    }
    this.authService.setUserPassword(this.authService.currentUserValue?.id, payload)
    .pipe(takeUntil(this.destroy$), exhaustMap((res:any) => {
      if(!res.hasErrors()) {
        return this.userService.getUser();
      } else {
        return (res);
      }
    }))
    .subscribe((res: any) => {
      if(!res.hasErrors()) {
        this.authService.updateUser(res.data);
        this.toast.success('Password Submitted Successfully', {
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
      }
    })
  }

  async openNew() {
    return await this.modal.open();
  }

  async closeModal() {
    return await this.modal.close();
  }

  async openEditModal(index: any, editIndex: any) {
    this.selectedIndex = index;
    this.voucherIndex = editIndex;
    this.dealIDForEdit = this.currentEvents[index].id;
    this.voucherId = this.currentEvents[index].subDeals[editIndex]?._id;
    this.editVouchers.patchValue({
      originalPrice: this.currentEvents[index].subDeals[editIndex]?.originalPrice,
      dealPrice: this.currentEvents[index].subDeals[editIndex]?.dealPrice,
      numberOfVouchers: this.currentEvents[index].subDeals[editIndex]?.numberOfVouchers,
      title: this.currentEvents[index].subDeals[editIndex]?.title
      })
    if(this.currentEvents[index]?.dealStatus == 'Published') {
      this.editVouchers.get('originalPrice')?.disable();
      this.editVouchers.get('dealPrice')?.disable();
      this.editVouchers.get('title')?.disable();
    }
    else {
      this.editVouchers.get('originalPrice')?.enable();
      this.editVouchers.get('dealPrice')?.enable();
      this.editVouchers.get('title')?.enable();
      this.editVouchers.get('numberOfVouchers')?.enable();
    }
    return await this.editModal.open();
  }

  async closeEditModal() {
    this.editVouchers.reset();
    return await this.editModal.close();
  }

  getTopDealsByMerchant() {
    this.showData = false;
    this.analytics.getPublishedDeals(this.page, this.limit)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any)=> {
      if (!res.hasErrors()) {
        this.dealData = res.data;
        this.currentEvents = res.data.deals;
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }

  duplicateDeal(index: number) {
    this.currentEvents[index].id = '';
    this.currentEvents[index].dealID = '';
    this.currentEvents[index].isCollapsed = false;
    delete this.currentEvents[index].createdAt;
    delete this.currentEvents[index].updatedAt;
    this.currentEvents[index]?.subDeals.map((value: any) => {
      value.originalPrice = parseFloat(value.originalPrice.toString().replace(',' , '.'));
      value.dealPrice = parseFloat(value.dealPrice.toString().replace(',' , '.'));
      return value
    });
    this.currentEvents[index].isDuplicate = true;
    this.dealService.createDeal(this.currentEvents[index]).pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.getTopDealsByMerchant();
        this.toast.success('Deal successfully duplicated', {
          duration: 1000
        });
      }
    })
  }

  next(): void {
    this.page;
    this.getTopDealsByMerchant();
  }

  async editDeal(index: number) {
    return await this.router.navigate(['/deals/create-deal']).finally(() => {
      switch (this.currentEvents[index]?.dealStatus) {
        case 'Draft':
          this.conn.sendStep1(this.currentEvents[index]);
        break;
        case 'Needs attention':
          this.conn.sendStep1(this.currentEvents[index]);
        break;
        case 'Published':
          this.conn.currentStep$.next(4);
          this.conn.sendSaveAndNext(this.currentEvents[index]);
        break;
        case 'Scheduled':
          this.conn.currentStep$.next(4);
          this.conn.sendSaveAndNext(this.currentEvents[index]);
        break;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
