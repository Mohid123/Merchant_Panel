import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
// import { zipCodes } from '@core/utils/belgium-zip-codes';
import { HotToastService } from '@ngneat/hot-toast';
import { Observable, Subject, Subscription } from 'rxjs';
import { debounceTime, first, takeUntil } from 'rxjs/operators';
import { CategoryList } from '../../models/category-list.model';
import { RegisterModel } from '../../models/register.model';
import { ZipCode } from '../../models/zip-code.model';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';
import { UrlValidator } from './url.validator';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit, OnDestroy {

  categoryData: CategoryList

  categories = [
    { id:2, img: '../../../../../assets/media/icons/accommodation.svg', name:'Accomodation' },
    { id:3, img: '../../../../../assets/media/icons/Dining.svg', name:'Dining' },
    { id:4, img: '../../../../../assets/media/icons/athletics.svg', name:'Sports, Adventures & Experiences' },
    { id:5, img: '../../../../../assets/media/icons/experiences-at-home.svg', name:'Experiences at Home' },
    { id:1, img: '../../../../../assets/media/icons/spaAndWellness.svg', name:'Spa And Wellness' },
    { id:6, img: '../../../../../assets/media/icons/personal-dev.svg', name:'Personal Development' },
    { id:7, img: '../../../../../assets/media/icons/concert-event-tickets.svg', name:'Concerts & Event Tickets' },
    { id:8, img: '../../../../../assets/media/icons/pets-care.svg', name:'Pet Treatments' },
  ]
  provincese = [
    { id:1, name:'West-Vlaanderen' },
    { id:2, name:'Oost-Vlaanderen' },
    { id:3, name:'Antwerpen' },
    { id:4, name:'Vlaams-Brabant' },
    // { id:5, name:'Luik' },
    { id:6, name:'Limburg' },
    // { id:7, name:'Waals-Brabant' },
  ]

  // zipCodes = zipCodes;
  registrationForm: FormGroup;
  hasError: boolean;
  isLoading$: Observable<boolean>;
  registrationSuccess = false;
  isLinear = false;
  offset: number = 0;
  limit: number = 7;
  destroy$ = new Subject();

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
    // })
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
        businessProfile: [null, Validators.required],
        firstName: [
          '',
            Validators.compose([
            Validators.required,
            Validators.maxLength(30),
          ]),
        ],
        lastName: [
          '',
            Validators.compose([
            Validators.required,
            Validators.maxLength(30),
          ]),
        ],
        email: [
          '',
            Validators.compose([
            Validators.required,
            Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
            Validators.maxLength(60),
          ]),
        ],
        phoneNumber: [
          '',
            Validators.compose([
            Validators.required,
            Validators.min(100000000),
            Validators.max(9999999999),
          ]),
        ],
        companyName: [
          '',
            Validators.compose([
            Validators.required,
            Validators.maxLength(30),
          ]),
        ],
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
            Validators.required],),
            this.validateZip()
          ]
        ],
        city: [
          '',
            Validators.compose([
            Validators.required,
            Validators.maxLength(100),
          ]),
        ],
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
        validator: UrlValidator('website_socialAppLink')
      })
    }

  submit() {
    console.log('thiasdasd:',this.f['province']);
    console.log('registrationForm:',this.registrationForm);
    this.hasError = false;
    const result: {
      [key: string]: string;
    } = {};
    Object.keys(this.f).forEach((key) => {
      result[key] = this.f[key].value;
    });
    const newModel = new RegisterModel();
    newModel.setModel(result);
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
    this.registrationForm.controls['zipCode']?.valueChanges
    .pipe(takeUntil(this.destroy$), debounceTime(600)).subscribe((response: string) => {
      if(response) {
        this.authService.fetchCityByZipCode(response)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: ApiResponse<ZipCode>) => {
        if(!res.hasErrors()) {
          this.registrationForm.get('city')?.setValue(res.data?.city);
        }
      })
    }
    else {
      this.registrationForm.get('city')?.setValue('');
    }
  })
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
