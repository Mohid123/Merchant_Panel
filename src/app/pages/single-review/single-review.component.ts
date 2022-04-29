import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReviewsService } from '@pages/services/reviews.service';
import { Subject } from 'rxjs';
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

  public reviewId: string;

  constructor(
    private activatedRoute : ActivatedRoute,
    private reviewService: ReviewsService,
    private cf: ChangeDetectorRef,
    private authService: AuthService
  ) {
    console.log('this.activatedRoute.snapshot.params:',this.activatedRoute.snapshot.params);
    this.reviewId = this.activatedRoute.snapshot.params['reviewId'];
   }

  ngOnInit(): void {
    this.authService.retreiveUserValue()
  }

  getReviewssByMerchant() {
    this.showData = false;
  }


}
