import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ModalConfig } from './../../../@core/models/modal.config';
import { ReusableModalComponent } from './../../../components/reusable-modal/reusable-modal/reusable-modal.component';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss']
})
export class AccountDetailsComponent implements OnInit {

  @ViewChild('contactModal') private contactModal: ReusableModalComponent;
  @ViewChild('billingModal') private billingModal: ReusableModalComponent;

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

  public showDiv = {
    profile: true,
    billingAddress: true,
    profileSettings: false,
    billingAddressSettings: false
  }

  private unsubscribe: Subscription[] = [];
  constructor(private cdr: ChangeDetectorRef) {
    const loadingSubscr = this.isLoading$
    .asObservable()
    .subscribe((res) => (this.isLoading = res));
  this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {
  }



  saveSettings() {
    this.isLoading$.next(true);
    setTimeout(() => {
      this.isLoading$.next(false);
      this.cdr.detectChanges();
    }, 1500);
  }

  async openContactModal() {
    return await this.contactModal.open();
  }

  async closeContactModal() {
    return await this.contactModal.close();
  }

  async openBillingModal() {
    return await this.billingModal.open();
  }

  async closeBillingModal() {
    return await this.billingModal.close();
  }

}
