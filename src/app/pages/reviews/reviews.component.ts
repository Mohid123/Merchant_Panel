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

  public reviewsData: ReviewList;
  showData: boolean;
  offset: number = 0;
  limit: number = 10;
  destroy$ = new Subject();

  reviews = [
    {
      product: 'Heavenly Massage',
      reviews: 57,
      highest: 5.0,
      lowest: 3.0,
      average: 4.0,
      id: '6578906654efg445hy'
    },
    {
      product: 'Earthly Massage',
      reviews: 67,
      highest: 5.0,
      lowest: 3.0,
      average: 4.0,
      id: '6578906654efg445hy'
    },
    {
      product: 'Firey Massage',
      reviews: 47,
      highest: 5.0,
      lowest: 3.0,
      average: 4.0,
      id: '6578906654efg445hy'
    },
    {
      product: 'Airy Massage',
      reviews: 67,
      highest: 5.0,
      lowest: 3.0,
      average: 4.0,
      id: '6578906654efg445hy'
    }
  ];

  constructor(
    private reviewService: ReviewsService,
    private cf: ChangeDetectorRef,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.authService.retreiveUserValue();
    this.getReviewsByMerchant();
  }

  getReviewsByMerchant() {
    this.showData = false;
    this.reviewService.getReviewsByMerchant(this.authService.merchantID, this.offset, this.limit)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res:ApiResponse<ReviewList>) => {
      if(!res.hasErrors()) {
        this.reviewsData = res.data;
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }

}
