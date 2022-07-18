import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { Reviews } from 'src/app/modules/wizards/models/reviews.model';
import { ReviewList } from './../../modules/wizards/models/review-list.model';
import { ReviewsService } from './../services/reviews.service';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit, OnDestroy {

  public reviewsData: ReviewList | any;
  showData: boolean;
  offset: number = 0;
  limit: number = 7;
  page: number;
  destroy$ = new Subject();
  dealID: string = '';
  averageRating: string = 'All';
  filteredResult: any;
  dealIDsArray: any;

  filtersForRating = [
    {
      id: 0,
      ratingName: '1 and up'
    },
    {
      id: 1,
      ratingName: '2 and up'
    },
    {
      id: 2,
      ratingName: '3 and up'
    },
    {
      id: 3,
      ratingName: '4 and up'
    },
    {
      id: 4,
      ratingName: '5 and up'
    },
    {
      id: 5,
      ratingName: 'All'
    }
  ]

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

  filterSelectedReviewByID(options: any) {
    this.dealIDsArray = options;
    this.getReviewsByMerchant();
  }

  filterByDealID(dealID: string) {
    this.offset = 0;
    this.dealID = dealID;
    const params: any = {
      dealIDsArray: this.dealIDsArray?.filterData ? this.dealIDsArray?.filterData : []
    }
    this.reviewService.getDealReviewStatsByMerchant(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.dealID, this.averageRating, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<ReviewList>) => {
      if(!res.hasErrors()) {
        this.filteredResult = res.data.data.map((filtered: Reviews) => {
          return {
            id: filtered._id,
            value: filtered.dealId,
            checked: false
          }
        });
        this.cf.detectChanges();
      }
    })
  }

  filterByRating(rating: string) {
    this.offset = 0;
    this.averageRating = rating;
    debugger
    this.filteredResult = this.filtersForRating.map((filtered: any) => {
      return {
        id: filtered.id,
        value: filtered.ratingName,
        checked: false
      }
    })
  }

  getReviewsByMerchant() {
    this.showData = false;
    const params: any = {
      dealIDsArray: this.dealIDsArray?.filterData ? this.dealIDsArray?.filterData : []
    }
    this.reviewService.getDealReviewStatsByMerchant(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.dealID, this.averageRating, params)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<ReviewList>) => {
      if(!res.hasErrors()) {
        this.reviewsData = res.data;
        console.log(this.reviewsData)
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }

  next():void {
    this.page;
    this.getReviewsByMerchant();
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }

}
