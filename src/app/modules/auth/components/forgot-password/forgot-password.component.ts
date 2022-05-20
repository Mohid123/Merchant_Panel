import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { HotToastService } from '@ngneat/hot-toast';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: boolean;

  // private fields
  private unsubscribe = new Subject(); // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: HotToastService,
    private cf: ChangeDetectorRef) {
      this.isLoading$ = false;
  }

  ngOnInit(): void {
    this.initForm();
  }

  // convenience getter for easy access to form fields

  initForm() {
    this.forgotPasswordForm = this.fb.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')
        ]),
        this.emailValidator()
      ],
    });
  }


  emailValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.valueChanges || control.pristine) {
        return null;
      }
      else {
        this.cf.detectChanges();
        return this.authService.checkEmailAlreadyExists(control.value).pipe(
          distinctUntilChanged(),
          debounceTime(600),
          map((res: ApiResponse<any>) => (res.data == false ? {emailExists: true} : null))
        )
      }
    };
}

  submit() {
    this.isLoading$ = true;
    this.authService.forgotPassword(this.forgotPasswordForm.value)
    .pipe(takeUntil(this.unsubscribe))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.isLoading$ = false;
        this.toast.success('OTP sent! Please check your email', {
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
        this.router.navigate(['/auth/enter-security-code'])
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
    })
  }
}
