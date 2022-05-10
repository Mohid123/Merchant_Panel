import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DealService } from '@core/services/deal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';

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
  }

  getTopDealsByMerchant() {
    this.showData = false;
    this.dealService.getTopRatedDeals(this.authService.merchantID).pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
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
