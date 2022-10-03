import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivityData } from 'src/app/modules/wizards/models/revenue.model';
import { AnalyticsService } from './../../../../../../pages/services/analytics.service';

@Component({
  selector: 'app-lists-widget5',
  templateUrl: './lists-widget5.component.html',
})

export class ListsWidget5Component implements OnInit {

  page: number;
  limit: number;
  activityData: any;
  private isLoading: BehaviorSubject<any> = new BehaviorSubject(false);
  public isLoading$: Observable<boolean> = this.isLoading.asObservable();
  disableInfiniteScroll: BehaviorSubject<any> = new BehaviorSubject(false);
  disableInfiniteScroll$: Observable<boolean> = this.disableInfiniteScroll.asObservable();
  merchantActivities: any;
  totalActivities: number;

  constructor(private analytics: AnalyticsService, private cf: ChangeDetectorRef) {
    this.page = 1;
    this.limit = 10
  }

  ngOnInit(): void {
    this.isLoading.next(true);
    this.getAllActivities().then(() => {
      this.isLoading.next(false);
    });
  }

  async getAllActivities() {
    this.analytics.getAllActivities(this.page, this.limit).pipe(map((res: ApiResponse<ActivityData>) => {
      if(!res.hasErrors()) {
        this.merchantActivities = res.data.data;
        this.totalActivities = res.data.totalActivities;
        this.cf.detectChanges();
      }
    })).subscribe();
  }

  onScrollDown() {
    this.page++;
    if(this.page <= 5) {
      this.analytics.getAllActivities(this.page, this.limit).pipe(map((res: ApiResponse<ActivityData>) => {
        if(!res.hasErrors()) {
          this.activityData = res.data.data;
          this.cf.detectChanges();
          this.totalActivities = res.data.totalActivities;
          this.merchantActivities = [...this.merchantActivities, ...this.activityData];
          debugger
          this.cf.detectChanges();
        }
      })).subscribe();
    }
    else if(this.page > 5) {
      debugger
      this.disableInfiniteScroll.next(true);
    }
  }

}
