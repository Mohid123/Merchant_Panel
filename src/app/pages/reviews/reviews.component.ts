import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { ReviewList } from './../../modules/wizards/models/review-list.model';
import { ReviewsService } from './../services/reviews.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {

  public reviewsData: ReviewList | any;
  showData: boolean;
  offset: number = 0;
  limit: number = 7;
  page: number;
  destroy$ = new Subject();

  constructor(
    private reviewService: ReviewsService,
    private cf: ChangeDetectorRef,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) {
    this.page = 1;
  }

  ngOnInit(): void {
    this.getReviewsByMerchant();
  }

  getReviewsByMerchant() {
    this.showData = false;
    this.reviewService.getDealReviewStatsByMerchant(this.page, this.authService.currentUserValue?.id, this.offset, this.limit)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<ReviewList>) => {
      debugger
      if(!res.hasErrors()) {
        this.reviewsData = res.data;
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }

  next():void {
    this.page++;
    this.getReviewsByMerchant();
  }

  previous():void {
    this.page--;
    this.getReviewsByMerchant();
  }

}
