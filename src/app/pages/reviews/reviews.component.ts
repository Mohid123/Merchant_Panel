import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
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
  }

}
