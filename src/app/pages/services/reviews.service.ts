import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { ApiService } from '@core/services/api.service';
import { Observable } from 'rxjs';
import { ReviewList } from 'src/app/modules/wizards/models/review-list.model';

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
    averageRating: string,
    data: {
      dealIDsArray: string[];
      ratingsArray: string[];
    }): Observable<ApiResponse<review>> {
    page--;
    dealID = dealID;
    offset = page ? limit * page : 0;
    limit = limit;
    return this.post(`/deal/getDealsReviewStatsByMerchant/${merchantID}?averageRating=${averageRating}&dealID=${dealID}&offset=${offset}&limit=${limit}`, data);
  }

  getDealReviews(dealID: string, offset: any, limit: any, page: number): Observable<ApiResponse<any>> {
    page--;
    const params: any = {
      offset: page ? limit * page : 0,
      limit: limit,
    }
    return this.get(`/deal/getDealReviews/${dealID}`, params)
  }

  // getDealReviews(merchantID: string | any, dealID: string): Observable<ApiResponse<any>> {
  //   return this.get(`/review/getMerchantReply/${merchantID}/${dealID}`);
  // }

  deleteReview(id: string): Observable<ApiResponse<review>> {
    return this.delete(`/review/deleteReview/${id}`);
  }
}
