import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ApiResponse } from '@core/models/response.model';
import { HotToastService } from '@ngneat/hot-toast';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { exhaustMap, takeUntil } from 'rxjs/operators';
import { UrlValidator } from 'src/app/modules/auth/components/registration/url.validator';
import { BusinessHours, initalBusinessHours } from 'src/app/modules/auth/models/business-hours.modal';
import { UserService } from 'src/app/modules/auth/services/user.service';
import { Gallery, User } from './../../@core/models/user.model';
import { MediaService } from './../../@core/services/media.service';
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
  urls: any[] = [];
  url: any;
  image: string = '';
  file: any;
  singleFile: any
  multiples: any[] = [];
  images: Gallery[] = [];
  private unsubscribe: Subscription[] = [];

  termsForm: FormGroup = this.fb.group({
    aboutUs: ['',Validators.minLength(40)],
    finePrint: ['',Validators.minLength(40)]
  })

  config: any;
  public Editor = ClassicEditor

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

    profilePicURL: this.image,
    gallery: this.images
  }
  , {
    validator: UrlValidator('website_socialAppLink'),
  })

  constructor(
    public authService: AuthService,
    private fb: FormBuilder,
    private toast: HotToastService,
    private cf: ChangeDetectorRef,
    private userService: UserService,
    private mediaService: MediaService) {

      const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
      this.unsubscribe.push(loadingSubscr);

    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: User | any) => {
      this.user = user;
      this.setbusinessHours();
      if(user)
      this.profileForm.patchValue(user);
      this.termsForm.patchValue(user);
   });
  }

  ngOnInit(): void {

    this.config = {
      toolbar: {
        styles: [
            'alignLeft', 'alignCenter', 'alignRight', 'full', 'side'
            ],
        items: [
          'heading',
          'fontSize',
          'bold',
          'italic',
          'underline',
          'highlight',
          'alignment',
          'indent',
          'outdent',
          'undo',
          'redo'
        ]
      }
    }
  }

  submitProfileChanges() {
    this.isLeftVisible = true;
    debugger
    this.profileForm.patchValue({gallery: this.images})
    this.profileForm.patchValue({profilePicURL: this.image})
    this.userService.updateMerchantprofile(this.profileForm.value)
    .pipe(exhaustMap((res: any) => {
      debugger
      if(!res.hasErrors()) {
        this.toast.success('Profile updated', {
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

  initBusinessForm() {
    this.businessForm = this.fb.group({
      finePrint: [
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
      let i: number = 0;
      for (const singlefile of event.target.files) {
        var reader = new FileReader();
        reader.readAsDataURL(singlefile);
        this.urls.push(singlefile);
        this.cf.detectChanges();
        i++;
      }
      if(this.urls.length > 0) {
        for (let index = 0; index < this.urls.length; index++) {
          this.mediaService.uploadMedia('profile-images', this.urls[index])
          .subscribe((res: ApiResponse<any>) => {
            if(!res.hasErrors()) {
              this.images.push(res.data?.url);
              debugger
              this.cf.detectChanges();
              this.urls = [];
              this.cf.detectChanges();
              if(this.images.length > 5) {
                this.images.pop();
                this.cf.detectChanges();
                this.toast.error('Upto 5 images are allowed', {
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
          });
        }
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

  onSelectSingle(event: any) {
    // if (event.target.files && event.target.files[0]) {
      this.url = event.target.files && event.target.files.length;
      if (this.url > 0) {
        let i: number = 0;
        for (const singlefile of event.target.files) {
          var reader = new FileReader();
          reader.readAsDataURL(singlefile);
          this.multiples.push(singlefile);
          this.cf.detectChanges();
          i++;
        }
      }
      for (let index = 0; index < this.multiples.length; index++) {
        this.mediaService.uploadMedia('profile-image', this.multiples[index]).subscribe((res: ApiResponse<any>) => {
          if(!res.hasErrors()) {
            this.image = res.data?.url;
            this.cf.detectChanges();
            this.multiples = [];
          }
        })
      }
    // }
  }

  onClick(event: any) {
    event.target.value = ''
  }

  clearImage() {
    this.image = '';
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

  saveTerms() {
    this.userService.updateMerchantprofile(this.termsForm.value).pipe(exhaustMap((res:any) => {
      // console.log('asdsad:',res);
      if(!res.hasErrors()) {
        this.toast.success('Data saved')
        return this.userService.getUser();
      } else {
        return (res);
      }
    })).subscribe((res:any) => {
      this.isEditBusinessHours = false;
      this.isLoading$.next(false);
    },(error=> {
      this.isLoading$.next(false);
      this.toast.error('error');
    }));
  }


  validateBusinessHours() {
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
