import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { ReviewList } from './../../modules/wizards/models/review-list.model';
import { CommonFunctionsService } from './../services/common-functions.service';
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
  searchPage: number;
  destroy$ = new Subject();
  dealID: string = '';
  averageRating: any;
  filteredResult: any;
  filterDealIDSearch: any[] = [];
  filteredResultSecond: any;
  dealIDsArray: any;
  appliedFilterID: boolean;
  appliedFilterStatus: boolean;

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
      ratingName: '5 only'
    }
  ]

  constructor(
    private reviewService: ReviewsService,
    private cf: ChangeDetectorRef,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    private commonService: CommonFunctionsService
  ) {
    this.page = 1;
  }

  ngOnInit(): void {
    this.getReviewsByMerchant();
    this.filteredResultSecond = this.filtersForRating.map((filtered: any) => {
      return {
        id: filtered.id,
        value: filtered.ratingName,
        checked: false
      }
    })
  }

  isFilterAppliedOnID(filteredID: any) {
    this.appliedFilterID = filteredID
  }

  isFilterAppliedOnStatus(filteredStatus: any) {
    this.appliedFilterStatus = filteredStatus
  }

  filterSelectedReviewByID(options: any) {
    this.dealIDsArray = options;
    this.getReviewsByMerchant();
  }

  filterSelectedReviewByRating(options: any) {
    this.averageRating = options;
    this.getReviewsByMerchant();
  }

  filterByDealID(dealID: any) {
    this.offset = 0;
    this.searchPage = dealID?.page;
    if(dealID?.value != this.searchPage) {
      this.filterDealIDSearch = [];
      this.commonService.optionsLengthIsZero = false;
    }
    const params: any = {
      dealIDsArray: [],
      ratingsArray: []
    }
    this.dealID = dealID?.value;
    if(this.dealID != '') {
      this.reviewService.getDealReviewStatsByMerchant(this.searchPage, this.authService.currentUserValue?.id, this.offset, 10, this.dealID, params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: ApiResponse<ReviewList>) => {
        if(!res.hasErrors()) { // totalMerchantReviews
          if(res.data?.totalMerchantReviews >= this.searchPage * 1) {
            this.commonService.finished = false;
            this.commonService.optionsLengthIsZero = false;
            this.cf.detectChanges();
            this.filteredResult = res.data.data.map((filtered: any) => {
              return {
                id: filtered._id,
                value: filtered.dealID,
                checked: false
              }
            });
            this.filterDealIDSearch.push(...this.filteredResult)
            this.cf.detectChanges();
          }
          else if(res.data?.totalMerchantReviews <= this.searchPage * 1) {
            this.commonService.finished = true
          }
        }
        if(res.data.data.length == 0) {
          this.commonService.optionsLengthIsZero = true;
          this.cf.detectChanges();
        }
      })
    }
    else {
      this.filterDealIDSearch.length = 0;
      this.commonService.optionsLengthIsZero = true;
      this.cf.detectChanges();
    }
  }


  getReviewsByMerchant() {
    this.showData = false;
    const params: any = {
      dealIDsArray: this.dealIDsArray?.filterData ? this.dealIDsArray?.filterData : [],
      ratingsArray: this.averageRating?.filterData ? this.averageRating?.filterData: []
    }
    this.reviewService.getDealReviewStatsByMerchant(this.page, this.authService.currentUserValue?.id, this.offset, this.limit, this.dealID, params)
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

  resetFilters() {
    this.limit = 7;
    this.appliedFilterID = false;
    this.appliedFilterStatus = false;
    this.averageRating = ['All'];
    this.dealIDsArray = [];
    this.filterDealIDSearch = [];
    this.dealID = '';
    this.getReviewsByMerchant();
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
