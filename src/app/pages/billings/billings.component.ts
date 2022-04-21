import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ReusableModalComponent } from '@components/reusable-modal/reusable-modal/reusable-modal.component';
import { ModalConfig } from '@core/models/modal.config';
import { ApiResponse } from '@core/models/response.model';
import { User } from '@core/models/user.model';
import { getItem, StorageItem } from '@core/utils';
import { BillingsService } from '@pages/services/billings.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BillingList } from 'src/app/modules/wizards/models/billing-list.model';

@Component({
  selector: 'app-billings',
  templateUrl: './billings.component.html',
  styleUrls: ['./billings.component.scss']
})
export class BillingsComponent implements OnInit {

  @ViewChild('modal') private modal: ReusableModalComponent;

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

  public billingsData: BillingList;
  merchantID: string;
  showData: boolean;
  offset: number = 0;
  limit: number = 10;
  destroy$ = new Subject();
  private _User$ = new BehaviorSubject<any>(getItem(StorageItem.User));
  public readonly User$: Observable<any> = this._User$.asObservable();

  constructor(private billingService: BillingsService, private cf: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.retreiveUserValue();
    this.getBillingsByMerchant();
  }

  get user(): User {
    return this._User$.getValue();
  }

  retreiveUserValue() {
    this.User$.subscribe((res:User) => {
      this.merchantID = res.id;
    })
  }

  getBillingsByMerchant() {
    this.showData = false;
    this.billingService.getAllBillingsByMerchantID(this.merchantID, this.offset, this.limit)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res:ApiResponse<BillingList>) => {
      this.billingsData = res.data;
      this.showData = true;
      this.cf.detectChanges();
    })
  }

  async openModal() {
    return await this.modal.open();
  }

  async closeModal() {
    return await this.modal.close();
  }


}
