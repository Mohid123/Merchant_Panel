import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { HotToastService } from '@ngneat/hot-toast';
import { Subscription } from 'rxjs';
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

  submit() {
    this.isLoading$ = true;
    const value = this.securityCodeForm.value?.securityCode.replace(/\s/g,'');
    if(value.length < 6) {
      this.toast.error('Security code should be 6 characters long', {
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
    else {
      const verifyOTP = this.authService.verifyOtp(parseInt(value)).subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.isLoading$ = false;
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
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
