import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { ModalConfig } from './../../../@core/models/modal.config';
import { ReusableModalComponent } from './../../../components/reusable-modal/reusable-modal/reusable-modal.component';
import { BusinessHours, initalBusinessHours } from './../../auth/models/business-hours.modal';

@Component({
  selector: 'app-bussiness-details',
  templateUrl: './bussiness-details.component.html',
  styleUrls: ['./bussiness-details.component.scss']
})
export class BussinessDetailsComponent implements OnInit {

  businessForm: FormGroup;
  config: any;
  public Editor = ClassicEditor

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


  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
  ) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);7

    const user = this.authService.currentUserValue;
    const businessHours = !!user?.businessHours.length ? user?.businessHours : initalBusinessHours;
    console.log('businessHours:',businessHours);
    this.businessHoursForm = this.fb.group({
      id: [user?.id],
      businessHours: this.fb.array([])
    });

     businessHours.forEach(businessHour => {
      this.addBusinessHour(businessHour)
     })

    console.log('businessHoursForm:',this.businessHoursForm);
  }



  get businessHoursFromControl() {
    return this.businessHoursForm.controls["businessHours"] as FormArray;
  }

  addBusinessHour(businessHour:BusinessHours) {
    const businessHoursGroup = this.fb.group({
      day: [''],
      firstStartTime: [''],
      firstEndTime: [''],
      secondStartTime: [''],
      secondEndTime: [''],
    });
    businessHoursGroup.patchValue(businessHour)
    this.businessHoursFromControl.push(businessHoursGroup);
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
          'numberedList',
          'bulletedList',
          'indent',
          'outdent',
          'todoList',
          'link',
          'blockQuote',
          'insertTable',
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

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
