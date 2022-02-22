import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss']
})
export class AccountDetailsComponent implements OnInit {
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

}
