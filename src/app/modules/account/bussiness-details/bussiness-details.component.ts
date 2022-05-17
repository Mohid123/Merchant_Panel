import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { HotToastService } from '@ngneat/hot-toast';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { exhaustMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { ModalConfig } from './../../../@core/models/modal.config';
import { User } from './../../../@core/models/user.model';
import { ReusableModalComponent } from './../../../components/reusable-modal/reusable-modal/reusable-modal.component';
import { BusinessHours, initalBusinessHours } from './../../auth/models/business-hours.modal';
import { UserService } from './../../auth/services/user.service';

@Component({
  selector: 'app-bussiness-details',
  templateUrl: './bussiness-details.component.html',
  styleUrls: ['./bussiness-details.component.scss']
})
export class BussinessDetailsComponent implements OnInit {
  destroy$ = new Subject();
  termsForm: FormGroup = this.fb.group({
    generalTermsAgreements: ['',Validators.minLength(40)],
    businessProfile: ['',Validators.minLength(40)]
  })
  businessForm: FormGroup;
  config: any;
  public Editor = ClassicEditor

  isEditBusinessHours: boolean;
  businessHoursForm: FormGroup;

  @ViewChild('companyModal') private companyModal: ReusableModalComponent;

  public modalConfig: ModalConfig = {
    onDismiss: () => {
      return true
    },
    dismissButtonLabel: "Dismiss",
    onClose: () => {
      return true
    },
    closeButtonLabel: "Close"
  }

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  private unsubscribe: Subscription[] = [];
  time = {hour: 13, minute: 30};
  meridian = true;

  public showDiv = {
    companyDetailsEdit: false,
    billingAddress: true,
   }

   user: User | null;


  constructor(
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private userService :UserService,
    private toast: HotToastService
  ) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);7

     this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user=> {
       this.user = user;
       this.setbusinessHours();

       if(user)
        this.termsForm.patchValue(user);
    });

    // console.log('businessHoursForm:',this.businessHoursForm);
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



  get businessHoursFromControl() {
    // console.log('this.businessHoursForm:',this.businessHoursForm);
    return this.businessHoursForm.controls["businessHours"] as FormArray;
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
    businessHoursGroup.patchValue(businessHour)
    this.businessHoursFromControl.push(businessHoursGroup);
    // console.log('this.businessHoursFromControl:',this.businessHoursFromControl);
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

  initBusinessForm() {
      this.businessForm = this.fb.group({
        businessProfile: [
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

  saveSettings() {
    this.isLoading$.next(true);
    setTimeout(() => {
      this.isLoading$.next(false);
      this.cdr.detectChanges();
    }, 1500);
  }

  async openCompanyModal() {
    return await this.companyModal.open();
  }

  async closeCompanyModal() {
    return await this.companyModal.close();
  }

  toggleMeridian() {
      this.meridian = !this.meridian;
  }

  editBusinessHours(){
    this.isEditBusinessHours = true;
  }

  discardBusinessHours() {
    this.isEditBusinessHours = false;
    this.setbusinessHours();
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

  isWorkingDay(formControls:AbstractControl, index:number) {
    if(!this.isEditBusinessHours) return;

    if (
      !formControls.value.isWorkingDay &&
      !formControls.value.firstStartTime &&
      !formControls.value.firstEndTime &&
      !formControls.value.secondStartTime &&
      !formControls.value.secondEndTime
    ) {
      formControls.patchValue(this.businessHoursFromControl.controls[index - 1].value)
    }

    formControls.value.isWorkingDay = !formControls.value.isWorkingDay;
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

  validateBusinessHours(){
    let valid = true;
    this.businessHoursForm.value.businessHours.forEach((businessHours:BusinessHours) => {
      console.log('asssss:',businessHours);
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

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
