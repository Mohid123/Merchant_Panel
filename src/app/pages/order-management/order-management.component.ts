import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { OrdersService } from '@pages/services/orders.service';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit {

  merchantID: string;
  showData: boolean;
  ordersData: any[] = [
    {
      voucherID: '3234635',
      deal: 'Heavenly Massage',
      dealSub: "The best deal in town!",
      amount: '3456',
      fee: '34',
      net: '321',
      status: 'Purchased',
      paymentStatus: 'Pending',
      date: '23, April, 2022'
    },
    {
      voucherID: '3234635',
      deal: 'Heavenly Massage',
      dealSub: "The best deal in town!",
      amount: '3456',
      fee: '34',
      net: '321',
      status: 'Purchased',
      paymentStatus: 'Pending',
      date: '23, April, 2022'
    },
    {
      voucherID: '3234635',
      deal: 'Heavenly Massage',
      dealSub: "The best deal in town!",
      amount: '3456',
      fee: '34',
      net: '321',
      status: 'Purchased',
      paymentStatus: 'Pending',
      date: '23, April, 2022'
    },
    {
      voucherID: '3234635',
      deal: 'Heavenly Massage',
      dealSub: "The best deal in town!",
      amount: '3456',
      fee: '34',
      net: '321',
      status: 'Purchased',
      paymentStatus: 'Pending',
      date: '23, April, 2022'
    },
  ];
  offset: number = 0;
  limit: number = 10;
  destroy$ = new Subject();
  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate;
  toDate: NgbDate | null = null;


  constructor(
    private orderService: OrdersService,
    private cf: ChangeDetectorRef,
    private authService: AuthService,
    calendar: NgbCalendar
    ) { }

  ngOnInit(): void {
    this.authService.retreiveUserValue();
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

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
