import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalConfig } from '@core/models/modal.config';
import { DealService } from '@core/services/deal.service';
import { HotToastService } from '@ngneat/hot-toast';
import { NgPasswordValidatorOptions } from 'ng-password-validator';
import { Subject, Subscription } from 'rxjs';
import { exhaustMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { CustomValidators } from './../../modules/auth/components/reset-password/custom-validators';
import { PasswordService } from './../../modules/auth/services/password-service';
import { UserService } from './../../modules/auth/services/user.service';
import { ReusableModalComponent } from './../../_metronic/layout/components/reusable-modal/reusable-modal.component';
import { ConfirmPasswordValidator } from './password-validator';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {

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

  newPassForm: FormGroup;
  showData: boolean;
  destroy$ = new Subject();
  topDeals: any;
  offset: number = 0;
  limit: number = 10;
  reciever: Subscription;
  oldpPass: string;
  validityPass: boolean;
  passwordHide: boolean = true;

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
    private authService: AuthService,
    private cf: ChangeDetectorRef,
    private fb: FormBuilder,
    private toast: HotToastService,
    private passService: PasswordService,
    private userService: UserService
    ) {
      this.validityPass = false;
    }

  ngOnInit(): void {
    this.reciever = this.passService.getData().subscribe((response: any) => {
      this.oldpPass = response;
    })
    this.getTopDealsByMerchant();
    this.initPassForm();
  }

  ngAfterViewInit(): void {
    this.checkNewuser();
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

  getTopDealsByMerchant() {
    this.showData = false;
    this.dealService.getTopRatedDeals(this.authService.currentUserValue?.id).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      if(!res.hasErrors()) {
        this.topDeals = res.data;
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
