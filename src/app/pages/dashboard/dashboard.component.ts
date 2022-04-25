import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { DealService } from '@core/services/deal.service';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { MainDeal } from 'src/app/modules/wizards/models/main-deal.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  showData: boolean;
  destroy$ = new Subject();
  topDeals: any;
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
    this.authService.retreiveUserValue();
    this.getTopDealsByMerchant();
  }

  getTopDealsByMerchant() {
    this.showData = false;
    this.dealService.getTopRatedDeals(this.authService.merchantID).subscribe((res: ApiResponse<MainDeal>) => {
      if(!res.hasErrors()) {
        this.topDeals = res.data;
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }

  getDealByFilters() {
    debugger
    const params: any = {
      title: this.title,
      price: this.price,
      startDate: this.startDate,
      endDate: this.endDate
    }
    this.dealService.getDealFilters(this.offset, this.limit, params)
    .pipe(take(1))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        debugger
        this.filteredData = res.data;
        console.log(this.filteredData)
      }
    })
  }

  filterByPrice(price: string) {
    this.offset = 0;
    this.price = price;
    this.getDealByFilters();
  }

  filterByTitle(title: string) {
    debugger
    this.offset = 0;
    this.title = title;
    this.getDealByFilters();
  }

  filterByStartDate(startDate: string) {
    this.offset = 0;
    this.startDate = startDate;
    this.getDealByFilters();
  }

  filterByEndDate(endDate: string) {
    this.offset = 0;
    this.endDate = endDate;
    this.getDealByFilters();
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
