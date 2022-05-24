import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { ReviewsService } from '@pages/services/reviews.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { Reviews } from './../../modules/wizards/models/reviews.model';

@Component({
  selector: 'app-single-review',
  templateUrl: './single-review.component.html',
  styleUrls: ['./single-review.component.scss']
})
export class SingleReviewComponent implements OnInit {

  public reviewData: Reviews | any;
  showData: boolean;
  offset: number = 0;
  limit: number = 10;
  destroy$ = new Subject();
  rating: number;

  ratings = [
    {
      value: 1,
      img: '../../../assets/media/logos/1.svg'
    },
    {
      value: 2,
      img: '../../../assets/media/logos/2.svg'
    },
    {
      value: 3,
      img: '../../../assets/media/logos/3.svg'
    },
    {
      value: 4,
      img: '../../../assets/media/logos/4.svg'
    },
    {
      value: 5,
      img: '../../../assets/media/logos/5.svg'
    }
  ]

  public reviewId: string;

  constructor(
    private activatedRoute : ActivatedRoute,
    private reviewService: ReviewsService,
    private cf: ChangeDetectorRef,
    private authService: AuthService
  ) {
    console.log('this.activatedRoute.snapshot.params:',this.activatedRoute.snapshot.params);
   }

  ngOnInit(): void {
    this.reviewId = this.activatedRoute.snapshot.params['dealId'];
    this.getReviewsByMerchant();
  }

  getReviewsByMerchant() {
    this.showData = false;
    const params: any = {
      rating: this.rating
    }
    this.reviewService.getDealReviews(this.reviewId, this.offset, this.limit, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<Reviews>) => {
      this.reviewData = res.data;
      this.showData = true;
      this.cf.detectChanges();
    })
  }

  filterByRating(rating: number) {
    debugger
    this.offset = 0;
    this.rating = rating;
    this.getReviewsByMerchant();
  }

  resetFilters() {
    this.offset = 0;
    this.rating = 0;
    this.getReviewsByMerchant();
  }


}
