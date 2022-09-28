import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiResponse } from '@core/models/response.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReviewsService } from '@pages/services/reviews.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { exhaustMap, takeUntil } from 'rxjs/operators';
import { Reviews } from 'src/app/modules/wizards/models/reviews.model';
import { AuthService } from './../../modules/auth/services/auth.service';

@Component({
  selector: 'app-new-reviews',
  templateUrl: './new-reviews.component.html',
  styleUrls: ['./new-reviews.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NewReviewsComponent implements OnInit {

  showData: boolean;
  destroy$ = new Subject();
  offset: number = 0;
  limit: number = 7;
  page: number;
  newReviews: Reviews[];
  totalCount: number;
  ReplySubject: BehaviorSubject<any> = new BehaviorSubject([]);
  ReplyObservable: Observable<any[]> = this.ReplySubject.asObservable();
  merchantReplyData: BehaviorSubject<any> = new BehaviorSubject({});
  merchantReplyDataObservable: Observable<any> = this.merchantReplyData.asObservable();
  voucherID: string;
  reviewID: string;
  reviewValues: any[] = [];
  switchToReply: boolean = false;
  replyView: boolean = false;
  replyForm: FormGroup;
  updateReviewID: string;

  @ViewChild('modal') private modal: TemplateRef<any>

  constructor(
    private modalService: NgbModal,
    private reviewService: ReviewsService,
    private authService: AuthService,
    private cf: ChangeDetectorRef,
    private fb: FormBuilder) {
    this.page = 1
  }

  ngOnInit(): void {
    this.getNewReviewsForMerchant();
    this.initReplyForm();
  }

  initReplyForm() {
    this.replyForm = this.fb.group({
      merchantReplyText: ''
    })
  }

  getNewReviewsForMerchant() {
    this.showData = false
    this.reviewService.getNewReviews(this.authService.currentUserValue?.id, this.offset, this.limit, this.page)
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        this.newReviews = res.data.data;
        this.totalCount = res.data.totalCount;
        this.showData = true;
        this.cf.detectChanges();
      }
    })
  }

  openReviewModal(reviewID: string, voucherID: string) {
    this.reviewID = reviewID;
    this.voucherID = voucherID;
    this.newReviews.find((value: Reviews) => {
      if(value.id == this.reviewID) {
        this.ReplySubject.value?.pop();
        this.reviewValues.push(value);
        this.ReplySubject.next(this.reviewValues);
        this.reviewValues.forEach((x: any) => {
          const merchantReplyText = x.merchantReplyText[0]
          this.merchantReplyData.next(merchantReplyText);
          console.log(this.ReplySubject.value)
        })
      }
    })
    return this.modalService.open(this.modal, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
      modalDialogClass: 'extra-largest'
    });
  }

  closeModal() {
    this.modalService.dismissAll();
  }

  updateReview(reviewID: string) {
    this.updateReviewID = reviewID;
    this.reviewService.updateReview(this.updateReviewID).pipe(takeUntil(this.destroy$)).subscribe();
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
        this.getNewReviewsForMerchant();
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
    this.getNewReviewsForMerchant();
  }

}
