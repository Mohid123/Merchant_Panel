import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { Subject } from 'rxjs';
import { exhaustMap, takeUntil } from 'rxjs/operators';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { User } from './../../@core/models/user.model';
import { AuthService } from './../../modules/auth/services/auth.service';

@Component({
  selector: 'app-business',
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss']
})
export class BusinessComponent implements OnInit, OnDestroy {

  isLeftVisible: boolean = true;
  secondLeftVisible: boolean = true;
  user: User | null;
  destroy$ = new Subject();

  businessForm: FormGroup = this.fb.group({

    firstName: ['',
    Validators.compose([
      Validators.required,
      Validators.pattern('^[ a-zA-Z][a-zA-Z ]*$')
    ])],

    lastName: ['',
    Validators.compose([
      Validators.required,
      Validators.pattern('^[ a-zA-Z][a-zA-Z ]*$')
    ])],

    phoneNumber: ['',
    Validators.compose([
      Validators.required,
      Validators.minLength(9)
    ])]
  });

  companyForm: FormGroup = this.fb.group({
    legalName: ['',
    Validators.compose([
      Validators.required,
    ])],

    streetAddress: ['',
    Validators.compose([
      Validators.required,
    ])],

    zipCode: [
      '',[
        Validators.compose([
        Validators.required]),
        this.validateZip()
      ]
    ],

    city: ['',
    Validators.compose([
      Validators.required,
    ])],

    vatNumber: ['',
    Validators.compose([
      Validators.required,
    ])],

    iban: ['',
    Validators.compose([
      Validators.required,
      Validators.minLength(15)
    ])],

  })

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private toast: HotToastService,
    private userService: UserService) {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | any) => {
      this.user = user;
      if(user)
      this.businessForm.patchValue(user);
      this.companyForm.patchValue(user)
   });
  }

  ngOnInit(): void {
  }

  editForm() {
    this.isLeftVisible = true;
    this.userService.updateMerchantprofile(this.businessForm.value)
    .pipe(exhaustMap((res: any) => {
      if(!res.hasErrors()) {
        this.toast.success('Contact details updated', {
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
        return this.userService.getUser();
        } else {
          return (res);
        }
    })).subscribe((res: any) => {
      console.log(res);
    })
  }

  discardUpper() {
    this.isLeftVisible = true;
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | any) => {
      this.user = user;
      if(user)
      this.businessForm.patchValue(user);
      this.companyForm.patchValue(user)
   });
  }

  discardLower() {
    this.secondLeftVisible = true;
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | any) => {
      this.user = user;
      if(user)
      this.businessForm.patchValue(user);
      this.companyForm.patchValue(user)
   });
  }

  editCompanyForm() {
    this.secondLeftVisible = true;
    this.userService.updateMerchantprofile(this.companyForm.value)
    .pipe(exhaustMap((res: any) => {
      if(!res.hasErrors()) {
        this.toast.success('Company details updated', {
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
        return this.userService.getUser();
        } else {
          return (res);
        }
    })).subscribe((res: any) => {
      console.log(res);
    })
  }


  validateZip(): {[key: string]: any} | null  {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value && control.value.toString().length !== 4) {
        return { 'zipInvalid': true };
      }
      return null;
    }
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}