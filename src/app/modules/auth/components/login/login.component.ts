import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthCredentials } from '@core/models/auth-credentials.model';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // KeenThemes mock, change it to:
  defaultAuth: any = {
    email: 'haider@gmail.com',
    password: 'qwertyuiop',
  };
  loginForm: FormGroup;
  hasError: boolean;
  returnUrl: string;
  isLoading$: Observable<boolean>;
  passwordHide: boolean = true;
  // validityPass: boolean;
  inputValue: string;

  // options: NgPasswordValidatorOptions = {
  //   placement: "bottom",
  //   "animation-duration": 500,
  //   shadow: true,
  //   theme: "pro",
  //   offset: 8,
  //   heading: "Password Policy",
  //   successMessage: "Password is Valid",
  //   rules: {
  //     password: {
  //         type: "range",
  //         length: 8,
  //         min: 8,
  //         max: 100,
  //     },
  //     "include-symbol": true,
  //     "include-number": true,
  //     "include-lowercase-characters": true,
  //     "include-uppercase-characters": true,
  //   }
  // }

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private _formBuilder: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.isLoading$ = this.authService.isLoading$;
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
    // this.validityPass = false;
  }

  ngOnInit(): void {
    this.initForm();
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
  }

  // get loginFormControl() {
  //   return this.loginForm.controls;
  // }

  initForm() {
    this.loginForm = this._formBuilder.group({
      email: [
        this.defaultAuth.email,
        Validators.compose([
          Validators.required,
          Validators.pattern(`[a-z0-9._%+-]+@[a-z0-9.-]+\.com$`),
          Validators.minLength(3),
          Validators.maxLength(320),
        ]),
      ],
      password: [
        this.defaultAuth.password,
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(100),
        ]),
      ],
    });
  }

  submit() {
    this.hasError = false;
    const loginSubscr = this.authService
      .login((<AuthCredentials>this.loginForm.value))
      .pipe(first())
      .subscribe((res) => {
        console.log('res:',res);
        if (res) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.hasError = true;
        }
      });
    this.unsubscribe.push(loginSubscr);
  }

  // isValid(str: string) {
  //   const pattern = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[-+_!@#$%^&*.,?]).+$");
  //   if (pattern.test(str)) {
  //     this.validityPass = true;
  //   }
  //   else {
  //     this.validityPass = false;
  //   }
  // }

  passwordShowHide(): void {
    this.passwordHide = !this.passwordHide;
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
