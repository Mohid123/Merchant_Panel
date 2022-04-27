import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ReusableModalComponent } from '@components/reusable-modal/reusable-modal/reusable-modal.component';
import { ModalConfig } from '@core/models/modal.config';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { BillingsService } from '@pages/services/billings.service';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';

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

  public billingsData: any[] = [
    {
      invoiceNo: '3234635',
      invoiceDate: "3, April 2022",
      invoiceAmount: '325,521',
      status: 'Paid'
    },
    {
      invoiceNo: '3234635',
      invoiceDate: "3, April 2022",
      invoiceAmount: '325,521',
      status: 'Paid'
    },
    {
      invoiceNo: '3234635',
      invoiceDate: "3, April 2022",
      invoiceAmount: '325,521',
      status: 'Paid'
    },
    {
      invoiceNo: '3234635',
      invoiceDate: "3, April 2022",
      invoiceAmount: '325,521',
      status: 'Paid'
    },
    {
      invoiceNo: '3234635',
      invoiceDate: "3, April 2022",
      invoiceAmount: '325,521',
      status: 'Paid'
    },
  ];
  showData: boolean;
  offset: number = 0;
  limit: number = 10;
  destroy$ = new Subject();
  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate;
  toDate: NgbDate | null = null;

  constructor(
    private billingService: BillingsService,
    private cf: ChangeDetectorRef,
    private authService: AuthService,
    calendar: NgbCalendar
    ) { }

  ngOnInit(): void {
    this.authService.retreiveUserValue()
  }



  async openModal() {
    return await this.modal.open();
  }

  async closeModal() {
    return await this.modal.close();
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }


}
