import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { ApiService } from '@core/services/api.service';
import { Observable } from 'rxjs';
import { ReviewList } from 'src/app/modules/wizards/models/review-list.model';
import { ReplySchema } from 'src/app/modules/wizards/models/single-review.model';

type review = ReviewList
@Injectable({
  providedIn: 'root'
})
export class ReviewsService extends ApiService<review> {

  constructor(protected override http:HttpClient) {
    super(http);
  }

  getDealReviewStatsByMerchant(
    page: number,
    merchantID: string | any,
    offset: any,
    limit: any,
    dealID: string,
    data: {
      dealIDsArray: string[];
      ratingsArray: string[];
    }): Observable<ApiResponse<review>> {
    page--;
    dealID = dealID;
    offset = page ? limit * page : 0;
    limit = limit;
    return this.post(`/deal/getDealsReviewStatsByMerchant/${merchantID}?dealID=${dealID}&offset=${offset}&limit=${limit}`, data);
  }

  getDealReviews(dealID: string, offset: any, limit: any, page: number): Observable<ApiResponse<any>> {
    page--;
    const params: any = {
      offset: page ? limit * page : 0,
      limit: limit,
    }
    return this.get(`/deal/getDealReviews/${dealID}`, params)
  }

  createReply(payload: ReplySchema): Observable<ApiResponse<any>> {
    return this.post(`/review/createReviewReply`, payload);
  }

  getMerchantReply(merchantID: string | any, reviewID: string): Observable<ApiResponse<any>> {
    return this.get(`/review/getMerchantReply/${merchantID}/${reviewID}`);
  }

  deleteReview(id: string): Observable<ApiResponse<review>> {
    return this.delete(`/review/deleteReview/${id}`);
  }

  getNewReviews(merchantID: string | any, offset: any, limit: any,page: number): Observable<ApiResponse<any>> {
    page--;
    const params: any = {
      offset: page ? limit * page : 0,
      limit: limit,
    }
    return this.get(`/review/getNewReviewsForMerchant/${merchantID}`, params);
  }

  updateReview(reviewID: string): Observable<ApiResponse<any>> {
    return this.post(`/review/updateReviewViewState/${reviewID}`)
  }


}
