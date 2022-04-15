import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ModalConfig } from './../../../@core/models/modal.config';
import { ReusableModalComponent } from './../../../components/reusable-modal/reusable-modal/reusable-modal.component';

@Component({
  selector: 'app-bussiness-details',
  templateUrl: './bussiness-details.component.html',
  styleUrls: ['./bussiness-details.component.scss']
})
export class BussinessDetailsComponent implements OnInit {

  businessForm: FormGroup

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


  constructor(private cdr: ChangeDetectorRef, private fb: FormBuilder) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {}

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
