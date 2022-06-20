import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HotToastService } from '@ngneat/hot-toast';
import { BehaviorSubject, Subscription } from 'rxjs';
import { exhaustMap } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { ModalConfig } from './../../../@core/models/modal.config';
import { ReusableModalComponent } from './../../../components/reusable-modal/reusable-modal/reusable-modal.component';
import { UserService } from './../../auth/services/user.service';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss']
})
export class AccountDetailsComponent implements OnInit {

  iban = '';
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
  constructor(
    public authService: AuthService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private toast: HotToastService,
  ) {
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

  async openBillingModal(iban:string) {
    this.iban = iban;
    return await this.billingModal.open();
  }

  async closeBillingModal() {
    return await this.billingModal.close();
  }

  saveBillingDetails() {
    this.isLoading$.next(true);
    this.userService.updateIBAN(this.authService.currentUserValue?.id, this.iban).pipe(exhaustMap((res:any) => {
      debugger
      if(!res.hasErrors()) {
        return this.userService.getUser();
      } else {
        return (res);
      }
    })).subscribe(res => {
      this.toast.success('IBAN Updated.')
      this.isLoading$.next(false);
      this.billingModal.close();
    });
  }

}
