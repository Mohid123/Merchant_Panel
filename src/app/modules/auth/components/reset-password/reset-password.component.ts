import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgPasswordValidatorOptions } from 'ng-password-validator';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
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
export class ResetPasswordComponent implements OnInit {

  createPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: boolean;
  private unsubscribe: Subscription[] = [];
  passwordHide: boolean = true;
  validityPass: boolean;

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
    private router: Router
  ) {
    this.isLoading$ = false;
    this.validityPass = false;
  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.createPasswordForm = this.fb.group({
      password: [
        '',
        Validators.compose([
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

  submit() {
    this.errorState = ErrorStates.NotSubmitted;
  }
}
