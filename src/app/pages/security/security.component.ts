import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '@core/models/user.model';
import { HotToastService } from '@ngneat/hot-toast';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { exhaustMap, takeUntil } from 'rxjs/operators';
import { CustomValidators } from 'src/app/modules/auth/components/reset-password/custom-validators';
import { ConfirmedValidator } from 'src/app/modules/auth/components/reset-password/password.validator';
import { AuthService } from './../../modules/auth/services/auth.service';
import { PasswordService } from './../../modules/auth/services/password-service';
import { UserService } from './../../modules/auth/services/user.service';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit, OnDestroy {

  passwordHide: boolean = true;
  pinHide: boolean = true;
  oldpPass: string;
  destroy$ = new Subject();
  reciever: Subscription;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  private unsubscribe: Subscription[] = [];
  passForm: FormGroup;
  user: User;

  constructor(
    private fb: FormBuilder,
    private passService: PasswordService,
    private authService: AuthService,
    private toast: HotToastService,
    private userService: UserService) {
      const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
      this.unsubscribe.push(loadingSubscr);

      this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | any) => {
        this.user = user;
     });
    }

  ngOnInit(): void {
    this.initPassForm();
  }

  initPassForm() {
    this.passForm = this.fb.group({

      oldPass: [
        '',
        Validators.compose([
          Validators.required
        ])
      ],

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
        ]),
      ],
      }, {
        validator: ConfirmedValidator('password', 'confirmPass')
    })
  }

  passwordShowHide(): void {
    this.passwordHide = !this.passwordHide;
  }

  showPin(): void {
    this.pinHide = !this.pinHide
  }

  submitPassword() {
    this.isLoading$.next(true);
    const payload: any = {
      password: this.passForm.value.oldPass,
      newPassword: this.passForm.value.password
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
        this.isLoading$.next(false);
        this.toast.success('Password Updated Successfully', {
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
        this.passForm.reset();
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

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
