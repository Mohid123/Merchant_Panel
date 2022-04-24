import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { ReviewsService } from '@pages/services/reviews.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { ReviewList } from 'src/app/modules/wizards/models/review-list.model';

@Component({
  selector: 'app-single-review',
  templateUrl: './single-review.component.html',
  styleUrls: ['./single-review.component.scss']
})
export class SingleReviewComponent implements OnInit {

  public reviewData: ReviewList;
  showData: boolean;
  offset: number = 0;
  limit: number = 10;
  destroy$ = new Subject();

  constructor(
    private reviewService: ReviewsService,
    private cf: ChangeDetectorRef,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.retreiveUserValue()
  }

  getReviewssByMerchant() {
    this.showData = false;
    this.reviewService.getReviewsByMerchant(this.authService.merchantID, this.offset, this.limit)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res:ApiResponse<ReviewList>) => {
      if(!res.hasErrors()) {
        this.reviewData = res.data;
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }


}
