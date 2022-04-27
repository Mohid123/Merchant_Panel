import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DealService } from '@core/services/deal.service';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  showData: boolean;
  destroy$ = new Subject();
  topDeals: any[] = [
    {
      title: 'Heavenly Massage',
      startDate: "3, April 2022",
      endDate: "16, April 2022",
      showDetail: false,
      available: '500',
      sold: '456',
      status: 'Active',
      average: '4.0'
    },
    {
      title: 'Earthly Massage',
      startDate: "1, April 2022",
      endDate: "6, April 2022",
      showDetail: false,
      available: '768',
      sold: '156',
      status: 'Active',
      average: '3.0'
    },
    {
      title: 'Firey Massage',
      startDate: "22, April 2022",
      endDate: "29, April 2022",
      showDetail: false,
      available: '34',
      sold: '12',
      status: 'Active',
      average: '4.0'
    },
    {
      title: 'Watery Massage',
      startDate: "23, April 2022",
      endDate: "26, April 2022",
      showDetail: false,
      available: '123',
      sold: '45',
      status: 'Active',
      average: '2.0'
    },
    {
      title: 'Airy Massage',
      startDate: "15, April 2022",
      endDate: "19, April 2022",
      showDetail: false,
      available: '65',
      sold: '12',
      status: 'Active',
      average:'1.0'
    },
    {
      title: 'Relaxing Massage',
      startDate: "14, April 2022",
      endDate: "18, April 2022",
      showDetail: false,
      available: '63',
      sold: '61',
      status: 'Active',
      average: '5.0'
    },
  ];
  public title: string;
  public price: string;
  public startDate: string;
  public endDate: string;
  offset: number = 0;
  limit: number = 10;
  filteredData: any;
  hoveredDate: NgbDate | null = null;
  fromDate: NgbDate;
  toDate: NgbDate | null = null;

  constructor(
    private dealService: DealService,
    private authService: AuthService,
    private cf: ChangeDetectorRef,
    calendar: NgbCalendar
    ) {
      this.fromDate = calendar.getToday();
      this.toDate = calendar.getNext(calendar.getToday(), 'd', 10);
    }

  ngOnInit(): void {
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
