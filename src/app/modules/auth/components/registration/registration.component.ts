import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { User } from '@core/models/user.model';
// import { zipCodes } from '@core/utils/belgium-zip-codes';
import { HotToastService } from '@ngneat/hot-toast';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, first, map, takeUntil } from 'rxjs/operators';
import { CategoryList } from '../../models/category-list.model';
import { RegisterModel } from '../../models/register.model';
import { VatResponse } from '../../models/vatResponse.model';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { ZipCode } from './../../models/zip-code.model';
import { UrlValidator } from './url.validator';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit, OnDestroy {

  categoryData: CategoryList;

  categories = [
    { id:2, img: '../../../../../assets/media/icons/Accomodations.svg', name:'Accomodation' },
    { id:3, img: '../../../../../assets/media/icons/Dinings.svg', name:'Dining' },
    { id:4, img: '../../../../../assets/media/icons/sports.svg', name:'Sports, Adventures & Experiences' },
    { id:5, img: '../../../../../assets/media/icons/experience.svg', name:'Experiences at Home' },
    { id:1, img: '../../../../../assets/media/icons/spa.svg', name:'Spa & Holistic Wellness' },
    { id:6, img: '../../../../../assets/media/icons/Personal-growth.svg', name:'Personal Development' },
    { id:7, img: '../../../../../assets/media/icons/concert-event-tickets.svg', name:'Concerts & Event Tickets' },
    { id:8, img: '../../../../../assets/media/icons/Pet-treatments.svg', name:'Pet Treatments' },
    { id:9, img: '../../../../../assets/media/icons/Metaverse.svg', name:'Metaverse' },
  ]
  provincese = [
    { id:3, name:'Antwerpen' },
    { id:6, name:'Limburg' },
    { id:2, name:'Oost-Vlaanderen' },
    { id:4, name:'Vlaams-Brabant' },
    { id:1, name:'West-Vlaanderen' },
    // { id:5, name:'Luik' },
    // { id:7, name:'Waals-Brabant' },
  ]

  cities: any = [];

  // zipCodes = zipCodes;
  registrationForm: FormGroup;
  hasError: boolean;
  isLoading$: Observable<boolean>;
  registrationSuccess = false;
  isLinear = false;
  offset: number = 0;
  limit: number = 7;
  destroy$ = new Subject();
  countryCode = '32';
  user: User
  fetchingName: boolean = false;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private _formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private categoryService: CategoryService,
    private cf: ChangeDetectorRef,
    private toast: HotToastService,
  ) {
    this.isLoading$ = this.authService.isLoading$;
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.getCategories();
    // this.f['zipCode'].valueChanges.subscribe(zip => {
    //   let zipData = zipCodes[zip];
    //   if(zipData) {
    //     console.log('zip data:',zipData);
    //   }
    // })ons
  }

  onCountryChange(country: any) {
    console.log('country.dialCode:',country.dialCode);
    this.countryCode = country.dialCode
  }

  getCategories() {
    // this.categoryService.getAllCategories(this.offset, this.limit)
    // .pipe(takeUntil(this.destroy$))
    // .subscribe((res: ApiResponse<CategoryList>) => {
    //   debugger
    //   if(!res.hasErrors()) {
    //     this.categoryData = res.data;
    //     this.cf.detectChanges();
    //   }
    // })
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.registrationForm.controls;
  }

  initForm() {
    this.registrationForm = this._formBuilder.group(
      {
        businessType: [[], Validators.required],
        vatNumber: [
          '',
          Validators.compose([
            Validators.required,
          ])
        ],
        firstName: [
          '',
            Validators.compose([
            Validators.required,
            Validators.maxLength(30),
            Validators.pattern('^[ a-zA-Z][a-zA-Z ]*$')
          ]),
        ],
        lastName: [
          '',
            Validators.compose([
            Validators.required,
            Validators.maxLength(30),
            Validators.pattern('^[ a-zA-Z][a-zA-Z ]*$')
          ]),
        ],
        email: [
          '',
            Validators.compose([
            Validators.required,
            Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'),
            Validators.maxLength(60),
          ]),
          this.emailValidator()
        ],
        phoneNumber: [
         '',
            Validators.compose([
            Validators.required,
            Validators.min(100000000),
            Validators.max(9999999999),
          ]),
        ],
        legalName: {value: '', disabled: true},
        streetAddress: [
          '',
            Validators.compose([
            Validators.required,
            Validators.maxLength(100),
          ]),
        ],
        zipCode: [
          '',[
            Validators.compose([
            Validators.required]),
            this.validateZip()
          ]
        ],
        city: [null, Validators.required],
        province: [null, Validators.required],
        website_socialAppLink: [
          '',
            Validators.compose([
            Validators.required,
            // Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?'),
            Validators.maxLength(100),
          ]),
        ],
      }
      , {
        validator: UrlValidator('website_socialAppLink'),
      })
  }

  changeProvince(e:any) {
    console.log(e.value)
    this.f['province'].setValue(e.target.value, {
      onlySelf: true
    })
  }

  onEnter() {
    if(this.registrationForm.valid) {
      this.submit();
    }
  }

  submit() {
    console.log('registrationForm:',this.registrationForm);
    debugger
    this.hasError = false;
    const result: {
      [key: string]: string;
    } = {};
    Object.keys(this.f).forEach((key) => {
      result[key] = this.f[key].value;
    });

    debugger
    const newModel = new RegisterModel();
    newModel.setModel(result);
    newModel.phoneNumber = '+' + this.countryCode  + newModel.phoneNumber;
    const registrationSubscr = this.authService
      .registration(newModel)
      .pipe(first())
      .subscribe((registerModel) => {
        if(!registerModel.hasErrors()){
          this.registrationSuccess = true; // need to remove in live version or while api intigration
        } else {
          console.log('eeeeee:',registerModel.errors);
          this.toast.error(registerModel.errors[0].error.message);
        }
      });
    this.unsubscribe.push(registrationSubscr);
  }

  matchZipCodeWithCity() {
    const zipCode = this.registrationForm.controls['zipCode']?.value;
      if(zipCode) {
        this.authService.fetchCityByZipCode(zipCode)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: ApiResponse<ZipCode>) => {
          if(!res.hasErrors() && res.data != null) {
            this.cities.push(res.data.city);
            this.cf.detectChanges();
          }
      })
    }
    else {
      this.cities = [];
    }
}

matchCompanywithVatNumber() {
  this.fetchingName = true;
  const vatNumber = this.registrationForm.controls['vatNumber']?.value;
  if(vatNumber) {
    this.authService.fetchCompanyByVatNumber(vatNumber)
    .pipe(takeUntil(this.destroy$), delay(400))
    .subscribe((res: ApiResponse<VatResponse>) => {
      if(!res.hasErrors() && res.data != null) {
        this.registrationForm.controls['legalName']?.setValue(res.data?.name);
        this.fetchingName = false;
        this.cf.detectChanges();
      }
      else {
        this.registrationForm.controls['legalName']?.setValue('');
        this.fetchingName = false;
        this.cf.detectChanges();
      }
    })
  }
  else {
    this.registrationForm.controls['legalName']?.setValue('');
    this.fetchingName = false;
    this.cf.detectChanges();
  }
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
          map((res: ApiResponse<any>) => (res.data == true ? {emailExists: true} : null))
        )
      }
    };
}

  registrationSuccessOk() {
    this.router.navigate(['auth','login']);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

  validateZip(): {[key: string]: any} | null  {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (control.value && control.value.toString().length !== 4) {
        return { 'zipInvalid': true };
      }
      return null;
    }
  }
}


// const payload: Partial<RegisterModel> = {
//   businessType: this.registrationForm.value.businessType,
//   firstName: this.registrationForm.value.firstName,
//   lastName: this.registrationForm.value.lastName,
//   email: this.registrationForm.value.email,
//   phoneNumber: `+${this.countryCode}${this.registrationForm.value.phoneNumber}`,
//   companyName: this.registrationForm.value.companyName,
//   streetAddress: this.registrationForm.value.streetAddress,
//   zipCode: this.registrationForm.value.zipCodes,
//   city: this.registrationForm.value.city,
//   province: this.registrationForm.value.province,
//   website_socialAppLink: this.registrationForm.value.website_socialAppLink,
// }
