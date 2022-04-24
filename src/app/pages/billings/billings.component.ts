import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ReusableModalComponent } from '@components/reusable-modal/reusable-modal/reusable-modal.component';
import { ModalConfig } from '@core/models/modal.config';
import { ApiResponse } from '@core/models/response.model';
import { BillingsService } from '@pages/services/billings.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
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
  showData: boolean;
  offset: number = 0;
  limit: number = 10;
  destroy$ = new Subject();

  constructor(
    private billingService: BillingsService,
    private cf: ChangeDetectorRef,
    private authService: AuthService
    ) { }

  ngOnInit(): void {
    this.authService.retreiveUserValue()
    this.getBillingsByMerchant();
  }

  getBillingsByMerchant() {
    this.showData = false;
    this.billingService.getAllBillingsByMerchantID(this.authService.merchantID, this.offset, this.limit)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res:ApiResponse<BillingList>) => {
      if(!res.hasErrors()) {
        this.billingsData = res.data;
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }

  async openModal() {
    return await this.modal.open();
  }

  async closeModal() {
    return await this.modal.close();
  }


}
