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

  getDealReviewStatsByMerchant(page:number, merchantID: string | any, offset: any, limit: any): Observable<ApiResponse<any>> {
    page--;
    const params: any = {
      offset: page ? limit * page : 0,
      limit: limit
    }
    return this.get(`/deal/getDealsReviewStatsByMerchant/${merchantID}`, params);
  }

  getDealReviews(dealID: string, offset: any, limit: any, data: {
    rating: number
  }): Observable<ApiResponse<any>> {
    const params: any = {
      offset: offset,
      limit: limit
    }
    if(data.rating) params.rating = data.rating;
    return this.get(`/deal/getDealReviews/${dealID}`, params)
  }

  deleteReview(id: string): Observable<ApiResponse<review>> {
    return this.delete(`/review/deleteReview/${id}`);
  }
}
