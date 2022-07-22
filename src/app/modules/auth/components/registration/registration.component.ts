import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { User } from '@core/models/user.model';
// import { zipCodes } from '@core/utils/belgium-zip-codes';
import { HotToastService } from '@ngneat/hot-toast';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, map, takeUntil } from 'rxjs/operators';
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
    { id:2, img: '../../../../../assets/media/icons/Accomodations.svg', name:'Accommodation', disabled: false },
    { id:3, img: '../../../../../assets/media/icons/Dinings.svg', name:'Dining', disabled: false },
    { id:4, img: '../../../../../assets/media/icons/sports.svg', name:'Sports & Adventures', disabled: false },
    { id:5, img: '../../../../../assets/media/icons/experience.svg', name:'Experiences at Home', disabled: false },
    { id:1, img: '../../../../../assets/media/icons/spa.svg', name:'Spa & Holistic', disabled: false },
    { id:6, img: '../../../../../assets/media/icons/Personal-growth.svg', name:'Personal Development', disabled: false },
    { id:7, img: '../../../../../assets/media/icons/concert-event-tickets.svg', name:'Concerts & Event Tickets', disabled: false },
    { id:8, img: '../../../../../assets/media/icons/Pet-treatments.svg', name:'Pet Treatments', disabled: false },
    { id:9, img: '../../../../../assets/media/icons/Metaverse.svg', name:'Metaverse', disabled: true },
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

  cityFromZip: any[] = [];

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
  fetchingName: boolean;
  vatControl = new FormControl();

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

    this.f['vatNumber'].valueChanges.pipe(takeUntil(this.destroy$), debounceTime(1000))
    .subscribe(value => {
      if(value != '' || value.length > 0) {
        this.matchCompanywithVatNumber();
      }
      else {
        this.registrationForm.controls['legalName']?.setValue('');
      }
    });

    this.f['zipCode'].valueChanges.pipe(takeUntil(this.destroy$), debounceTime(400))
    .subscribe(value => {
      if(value != '' && value.length == 4) {
        this.matchZipCodeWithCity()
      }
      else {
        this.cities = [];
        this.cf.detectChanges();
      }
    })
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
            Validators.pattern('^[a-zA-Z0-9 ]+')
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
            Validators.required
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
        .subscribe((res: ApiResponse<ZipCode[]>) => {
          if(!res.hasErrors() && res.data.length != 0) {
            this.cities = res.data.filter(city => city.city).map((cityName) => {
              return cityName.city
            })
            this.cf.detectChanges();
          }
          else if(res.data.length == 0) {
            this.registrationForm.controls['zipCode']?.setErrors({
              notAvailable: true
            });
            this.registrationForm.controls['zipCode']?.markAsTouched();
            this.cities = [];
            this.cf.detectChanges();
          }
          else {
            this.cities = [];
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
  this.cf.detectChanges();
  const vatNumber = this.registrationForm.controls['vatNumber']?.value;
  if(vatNumber) {
    this.authService.fetchCompanyByVatNumber(vatNumber)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<VatResponse>) => {
      if(!res.hasErrors() && res.data != null) {
        this.registrationForm.controls['legalName']?.setValue(res.data?.name);
        this.fetchingName = false;
        this.cf.detectChanges();
      }
      else {
        this.registrationForm.controls['legalName']?.setValue('');
        this.registrationForm.controls['vatNumber']?.setErrors({
          notAvailable: true
        });
        this.registrationForm.controls['vatNumber']?.markAsTouched();
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
    this.destroy$.complete();
    this.destroy$.unsubscribe();
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

// this.toast.error('Please provide valid zip code', {
//   style: {
//     border: '1px solid #b71c1c',
//     padding: '16px',
//     color: '#b71c1c',
//   },
//   iconTheme: {
//     primary: '#b71c1c',
//     secondary: '#ffcdd2',
//   }
// })
