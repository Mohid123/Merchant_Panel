import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { HotToastService } from '@ngneat/hot-toast';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  selector: 'app-security-code',
  templateUrl: './security-code.component.html',
  styleUrls: ['./security-code.component.scss']
})
export class SecurityCodeComponent implements OnInit {

  securityCodeForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: boolean;
  destroy$ = new Subject();

  private unsubscribe: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cf: ChangeDetectorRef,
    private toast: HotToastService) {

    this.isLoading$ = false
  }


  ngOnInit(): void {
    this.initForm();
    this.authService.emailSubject$.value
  }

  initForm() {
    this.securityCodeForm = this.fb.group({
      securityCode: [
        '',
        Validators.compose([
          Validators.required
        ]),
      ],
    });
  }

  resendOTP() {
    this.authService.forgotPassword(this.authService.emailSubject$.value)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.toast.success('OTP has been resent! Please check your email', {
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
      else {
        this.toast.error(res.errors[0]?.error?.message, {
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
    })
  }

  submit() {
    this.isLoading$ = true;
    const otpValue = parseInt(this.securityCodeForm.value?.securityCode.replace(/\s/g,''))
      const verifyOTP = this.authService.verifyOtp(otpValue)
      .subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.isLoading$ = false;
          this.toast.success('OTP verified! Please reset your password', {
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
          this.router.navigate(['/auth/reset-password'])
        }
        else {
          this.isLoading$ = false;
          this.cf.detectChanges();
          this.toast.error(res.errors[0]?.error?.message, {
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
        this.unsubscribe.push(verifyOTP);
      })
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
