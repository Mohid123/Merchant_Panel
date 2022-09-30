import { Component, OnInit } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { Observable } from 'rxjs';
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
  activityData: Observable<any>

  constructor(private analytics: AnalyticsService) {
    this.page = 1;
    this.limit = 8
  }

  ngOnInit(): void {
    this.getAllActivities();
  }

  getAllActivities() {
    this.activityData = this.analytics.getAllActivities(this.page, this.limit).pipe(map((res: ApiResponse<ActivityData>) => res.data))
  }

}
