import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { CategoryList } from '../../models/category-list.model';
import { RegisterModel } from '../../models/register.model';
import { AuthService } from '../../services/auth.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit, OnDestroy {

  categoryData: CategoryList

  categories = [
    { id:2, img: '../../../../../assets/media/icons/accommodation.svg', name:'Accomodation' },
    { id:3, img: '../../../../../assets/media/icons/dining.svg', name:'Dining' },
    { id:4, img: '../../../../../assets/media/icons/athletics.svg', name:'Sports, Adventures & Experiences' },
    { id:5, img: '../../../../../assets/media/icons/experiences-at-home.svg', name:'Experiences at Home' },
    { id:1, img: '../../../../../assets/media/icons/spaAndWellness.svg', name:'Spa And Wellness' },
    { id:6, img: '../../../../../assets/media/icons/personal-dev.svg', name:'Personal Development' },
    { id:7, img: '../../../../../assets/media/icons/concert-event-tickets.svg', name:'Concerts & Event Tickets' },
  ]
  provincese = [
    { id:1, name:'West-Vlaanderen' },
    { id:2, name:'Oost-Vlaanderen' },
    { id:3, name:'Antwerpen' },
    { id:4, name:'Vlaams-Brabant' },
    { id:5, name:'Luik' },
    { id:6, name:'Limburg' },
    { id:7, name:'Waals-Brabant' },
  ]

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
    private cf: ChangeDetectorRef
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
        category: [null, Validators.required],
        firstName: [
          '',
            Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(30),
          ]),
        ],
        lastName: [
          '',
            Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(30),
          ]),
        ],
        email: [
          '',
            Validators.compose([
            Validators.required,
            Validators.email,
            Validators.maxLength(60),
          ]),
        ],
        mobile: [
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
            Validators.minLength(3),
            Validators.maxLength(30),
          ]),
        ],
        streetAddress: [
          '',
            Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
        zip: [
          '',
            Validators.compose([
            Validators.required,
            Validators.min(100),
            Validators.max(9999999999),
          ]),
        ],
        city: [
          '',
            Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
        province: [null, Validators.required],
        website: [
          '',
            Validators.compose([
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ]),
        ],
      }
    );
  }

  submit() {
    debugger
    console.log('thiasdasd:',this.f['province']);
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
      .subscribe((registerModel: RegisterModel) => {
        console.log('re:',registerModel);
        this.registrationSuccess = true; // need to remove in live version or while api intigration
        if (registerModel) {
          this.registrationSuccess = true;
        } else {
          this.hasError = true;
        }
      });
    this.unsubscribe.push(registrationSubscr);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
