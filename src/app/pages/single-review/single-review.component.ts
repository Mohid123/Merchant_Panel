import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReviewsService } from '@pages/services/reviews.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { Reviews } from './../../modules/wizards/models/reviews.model';

@Component({
  selector: 'app-single-review',
  templateUrl: './single-review.component.html',
  styleUrls: ['./single-review.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SingleReviewComponent implements OnInit, OnDestroy {

  public reviewData: Reviews | any;
  showData: boolean;
  offset: number = 0;
  limit: number = 10;
  destroy$ = new Subject();
  rating: number;
  page: number;

  Substring: string;
  CompanyName: string;
  switchToReply: boolean = false;
  replyView: boolean = false;
  semiLorem: string;
  loremIpsum: string = 'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.'

  @ViewChild('modal') private modal: TemplateRef<any>

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
    private authService: AuthService,
    private modalService: NgbModal
  ) {
    console.log('this.activatedRoute.snapshot.params:',this.activatedRoute.snapshot.params);
    const name = 'Harry Jonas'
    this.Substring = name.substring(0, 1);
    const companyName = 'Comapny Name';
    this.CompanyName = companyName.substring(0, 1);
    this.semiLorem = this.loremIpsum.substring(0, 152);
    this.page = 1;
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
      console.log(this.reviewData)
      this.showData = true;
      this.cf.detectChanges();
    })
  }

  filterByRating(rating: number) {
    this.offset = 0;
    this.rating = rating;
    this.getReviewsByMerchant();
  }

  resetFilters() {
    this.offset = 0;
    this.rating = 0;
    this.getReviewsByMerchant();
  }

  openReviewModal() {
    return this.modalService.open(this.modal, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
      modalDialogClass: 'extra-large'
    });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  switchToReplyMode() {
    this.switchToReply = true;
  }

  discardReply() {
    this.switchToReply = false;
  }

  submitReply() {
    this.switchToReply = true;
    this.replyView = true;
  }

  ngOnDestroy() {
    this.destroy$.complete();
    this.destroy$.unsubscribe();
  }


}
