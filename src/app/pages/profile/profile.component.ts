import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HotToastService } from '@ngneat/hot-toast';
import { BehaviorSubject, Subject } from 'rxjs';
import { exhaustMap, takeUntil } from 'rxjs/operators';
import { UrlValidator } from 'src/app/modules/auth/components/registration/url.validator';
import { BusinessHours, initalBusinessHours } from 'src/app/modules/auth/models/business-hours.modal';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { Gallery, User } from './../../@core/models/user.model';
import { AuthService } from './../../modules/auth/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  isEditBusinessHours: boolean;
  businessHoursForm: FormGroup;
  businessForm: FormGroup;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;

  secondLeftVisible: boolean = true;
  isLeftVisible: boolean = true;
  user: User | null;
  destroy$ = new Subject();
  urls: Gallery[] = [];
  url: string = '';
  file: any;
  singleFile: any
  multiples: any[] = [];
  images = [];

  profileForm: FormGroup = this.fb.group({
    tradeName: ['',
      Validators.compose([
        Validators.required,
      ])
    ],

    streetAddress: ['',
      Validators.compose([
        Validators.required
      ])
    ],

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
      ])
    ],

    googleMapPin: ['',
      Validators.compose([
        Validators.required,
      ])
    ],

    website_socialAppLink: ['',
      Validators.compose([
        Validators.required,
      ])
    ],

    profilePicURL: '',
    gallery: this.urls,
  }
  , {
    validator: UrlValidator('website_socialAppLink'),
  })

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private toast: HotToastService,
    private cf: ChangeDetectorRef,
    private userService: UserService) {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | any) => {
      this.user = user;
      this.setbusinessHours();
      if(user)
      this.profileForm.patchValue(user);
   });
  }

  ngOnInit(): void {
  }

  initBusinessForm() {
    this.businessForm = this.fb.group({
      businessType: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(300),
        ]),
      ],
      validity: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(300),
        ]),
      ],
      purchase: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(300),
        ]),
      ],
      cancellation: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(300),
        ]),
      ],
      extraInfo: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(13),
          Validators.maxLength(300),
        ]),
      ],
    })
  }

  onSelectFile(event: any) {
    this.file = event.target.files && event.target.files.length;
    if (this.file > 0 && this.file < 6) {
      // this.images = event.target.files;
      let i: number = 0;
      for (const singlefile of event.target.files) {
        var reader = new FileReader();
        reader.readAsDataURL(singlefile);
        this.urls.push(singlefile);
        this.cf.detectChanges();
        i++;
        reader.onload = (event) => {
          const url = (<FileReader>event.target).result as string;
          this.multiples.push(url);
          this.cf.detectChanges();
          // If multple events are fired by user
          if (this.multiples.length > 5) {
            // If multple events are fired by user
            this.multiples.pop();
            this.cf.detectChanges();
            this.urls.pop();
            this.toast.error('Please select upto 5 images', {
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
        };
      }
    }
    else {
      this.toast.error('Please select upto 5 images', {
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
  }

  onSelectSingle(event: any) { // called each time file input changes
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]); // read file as data url
      this.cf.detectChanges();
      reader.onload = (event: any) => { // called once readAsDataURL is completed
        this.url = event.target.result;
        this.cf.detectChanges();
      }
    }
  }

  onClick(event: any) {
    event.target.value = ''
  }

  clearImage() {
    this.url = '';
  }

  get businessHoursFromControl() {
    // console.log('this.businessHoursForm:',this.businessHoursForm);
    return this.businessHoursForm.controls["businessHours"] as FormArray;
  }

  editBusinessHours(){
    this.isEditBusinessHours = true;
    for (let i = 0; i < 7; i++) {
      this.businessHoursFromControl.controls.forEach(control => {
        control.enable();
      })
    }
  }

  discardBusinessHours() {
    this.isEditBusinessHours = false;
    this.setbusinessHours();
  }

  setbusinessHours() {
    this.businessHoursForm = this.fb.group({
      id: [''],
      businessHours: this.fb.array( [])
    });
   const businessHours = !!this.user?.businessHours.length ? this.user?.businessHours : initalBusinessHours;
   // console.log('businessHours:',businessHours);
   this.businessHoursForm.controls['id'].setValue(this.user?.id);
    businessHours.forEach(businessHour => {
     this.addBusinessHour(businessHour)
    })
  }

  addBusinessHour(businessHour:BusinessHours) {
    const businessHoursGroup = this.fb.group({
      day: [''],
      firstStartTime: [''],
      firstEndTime: [''],
      secondStartTime: [''],
      secondEndTime: [''],
      isWorkingDay: true,
    });
    businessHoursGroup.disable();
    businessHoursGroup.patchValue(businessHour)
    this.businessHoursFromControl.push(businessHoursGroup);
    // console.log('this.businessHoursFromControl:',this.businessHoursFromControl);
  }

  saveBusinessHours(){
    if(this.validateBusinessHours()) {
      this.isEditBusinessHours = false;
      this.isLoading$.next(true);
      this.userService.updateBusinessHours(this.businessHoursForm.value).pipe(exhaustMap((res:any) => {
        // console.log('asdsad:',res);
        if(!res.hasErrors()) {
          return this.userService.getUser();
        } else {
          return (res);
        }
      })).subscribe((res:any) => {
        this.isLoading$.next(false);
      },(error=> {
        this.isLoading$.next(false);
        this.toast.error('error');
      }));
  } else {
    this.toast.warning('Enter business hours')
  }
}


  validateBusinessHours(){
    let valid = true;
    this.businessHoursForm.value.businessHours.forEach((businessHours:BusinessHours) => {
      if(valid && !businessHours.isWorkingDay || (
          businessHours.firstStartTime.length &&
          businessHours.firstEndTime.length &&
          businessHours.secondStartTime.length &&
          businessHours.secondEndTime.length)){
            console.log('valid day:',businessHours.day);
          }
          else {
            valid = false;
          }
    })
    return valid;
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
