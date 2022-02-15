import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { RegisterModel } from '../../models/register.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit, OnDestroy {

  categories = [
    { id:1, img: '../../../../../assets/media/icons/spaAndWellness.svg', name:'Spa And Wellness' },
    { id:2, img: '../../../../../assets/media/icons/accomodation.svg', name:'Accomodation' },
    { id:3, img: '../../../../../assets/media/icons/Dining.svg', name:'Dining' },
    { id:4, img: '../../../../../assets/media/icons/fashion.svg', name:'Fashion' },
    { id:5, img: '../../../../../assets/media/icons/HomeAndDeco.svg', name:'Home And Deco' },
    { id:6, img: '../../../../../assets/media/icons/leisure.svg', name:'Lisure' },
    { id:7, img: '../../../../../assets/media/icons/others.svg', name:'Others' },
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

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private _formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.isLoading$ = this.authService.isLoading$;
    // redirect to home if already logged in
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.initForm();
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
      .subscribe((regesterModel: RegisterModel) => {
        console.log('re:',regesterModel);
        this.registrationSuccess = true; // need to remove in live version or while api intigration
        if (regesterModel) {
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
