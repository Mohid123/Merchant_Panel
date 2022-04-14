import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
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
  isLoading$: Observable<boolean>;

  private unsubscribe: Subscription[] = [];

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.isLoading$ = this.authService.isLoading$;
  }


  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.securityCodeForm = this.fb.group({
      securityCode: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(37)
        ]),
      ],
    });
  }

  submit() {
    this.errorState = ErrorStates.NotSubmitted;
    const securitySubscr = this.authService
      .forgotPassword(this.securityCodeForm.controls['securityCode'].value)
      .pipe(first())
      .subscribe((result: boolean) => {
        this.errorState = result ? ErrorStates.NoError : ErrorStates.HasError;
        this.router.navigate(['/auth/reset-password'])
      });
    this.unsubscribe.push(securitySubscr);
  }

}
