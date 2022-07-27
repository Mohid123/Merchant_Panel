import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReviewsService } from '@pages/services/reviews.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { exhaustMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/modules/auth';
import { SingleReview } from 'src/app/modules/wizards/models/single-review.model';
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
  replyForm: FormGroup;

  Substring: string;
  CompanyName: string;
  switchToReply: boolean = false;
  replyView: boolean = false;
  semiLorem: string;
  loremIpsum: string = 'dasdasdasdasdd';
  reviewValues: any[] = [];
  ReplySubject: BehaviorSubject<any> = new BehaviorSubject([]);
  ReplyObservable: Observable<any[]> = this.ReplySubject.asObservable();
  merchantReplyData: BehaviorSubject<any> = new BehaviorSubject({});
  merchantReplyDataObservable: Observable<any> = this.merchantReplyData.asObservable();
  voucherID: string;
  reviewID: string;

  @ViewChild('modal') private modal: TemplateRef<any>

  public reviewId: string;

  constructor(
    private activatedRoute : ActivatedRoute,
    private reviewService: ReviewsService,
    private cf: ChangeDetectorRef,
    private authService: AuthService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    const companyName = 'Comapny Name';
    this.CompanyName = companyName.substring(0, 1);
    this.semiLorem = this.loremIpsum.substring(0, 152);
    this.page = 1;
   }

  ngOnInit(): void {
    this.reviewId = this.activatedRoute.snapshot.params['dealId'];
    this.getReviewsByMerchant();
    this.initReplyForm()
  }

  initReplyForm() {
    this.replyForm = this.fb.group({
      merchantReplyText: ''
    })
  }

  getReviewsByMerchant() {
    this.showData = false;
    const params: any = {
      rating: this.rating
    }
    this.reviewService.getDealReviews(this.reviewId, this.offset, this.limit, this.page)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<SingleReview>) => {
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

  openReviewModal(reviewID: string, voucherID: string) {
    this.reviewID = reviewID;
    this.voucherID = voucherID;
    this.reviewData.Reviews?.find((value: any) => {
      if(value._id == this.reviewID) {
        this.ReplySubject.value?.pop();
        this.reviewValues.push(value);
        this.ReplySubject.next(this.reviewValues);
        this.reviewValues.forEach((x: any) => {
          const merchantReplyText = x.merchantReplyText[0]
          this.merchantReplyData.next(merchantReplyText);
        })
      }
    })
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
    const payload: any = {
      reviewID: this.reviewID,
      merchantID: this.authService.currentUserValue?.id,
      voucherID: this.voucherID,
      merchantName: this.authService.currentUserValue?.firstName,
      legalName: this.authService.currentUserValue?.legalName,
      profilePicURL: this.authService.currentUserValue?.profilePicURL,
      merchantReplyText: this.replyForm.get('merchantReplyText')?.value,
      deletedCheck: false
    }
    this.reviewService.createReply(payload).pipe(takeUntil(this.destroy$), exhaustMap((res: any): any => {
      if(!res.hasErrors()) {
        this.switchToReply = false;
        this.getReviewsByMerchant();
        return this.merchantReplyData.next({...res.data});
      }
      else {
        return(res)
      }
    }))
    .subscribe()
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
