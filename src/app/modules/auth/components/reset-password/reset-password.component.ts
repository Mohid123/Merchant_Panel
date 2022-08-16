import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { HotToastService } from '@ngneat/hot-toast';
import { NgPasswordValidatorOptions } from 'ng-password-validator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { CustomValidators } from './custom-validators';
import { ConfirmedValidator } from './password.validator';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {

  createPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: boolean;
  private unsubscribe = new Subject();
  passwordHide: boolean = true;
  validityPass: boolean;
  token: string;
  showPopup: boolean;

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
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cf: ChangeDetectorRef,
    private toast: HotToastService
  ) {
    this.isLoading$ = false;
    this.validityPass = false;
    this.showPopup = false;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.createPasswordForm = this.fb.group({
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
        ]),
      ],
      confirmPassword: [
        '',
        Validators.compose([
          Validators.required
        ]),
      ],
    }, {
      validator: ConfirmedValidator('password', 'confirmPassword')
    });
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

  submit() {
    this.isLoading$ = true;
    this.authService.resetPassword(this.createPasswordForm.controls['password']?.value)
    .pipe(takeUntil(this.unsubscribe))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.isLoading$ = false;
        this.toast.success('Password successfully reset', {
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
        this.router.navigate(['/auth/login']);
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
  ngOnDestroy() {
    this.unsubscribe.complete();
    this.unsubscribe.unsubscribe();
  }
}


