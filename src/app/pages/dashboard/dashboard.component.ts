import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { DealService } from '@core/services/deal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
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
  offset: number = 0;
  limit: number = 10;

  constructor(
    private dealService: DealService,
    private authService: AuthService,
    private cf: ChangeDetectorRef
    ) { }

  ngOnInit(): void {
    this.authService.retreiveUserValue();
    this.getTopDealsByMerchant();
  }

  getTopDealsByMerchant() {
    this.showData = false;
    this.dealService.getTopRatedDeals(this.authService.merchantID).pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<MainDeal>) => {
      if(!res.hasErrors()) {
        this.topDeals = res.data;
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
