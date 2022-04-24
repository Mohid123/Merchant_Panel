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

  getAllReviews(offset: any, limit: any): Observable<ApiResponse<review>> {
    const params: any = {
      offset: offset,
      limit: limit
    }
    return this.get(`/review/getAllReviews`, params);
  }

  getReviewsByMerchant(merchantId: string, offset: any, limit: any): Observable<ApiResponse<review>> {
    const params: any = {
      merchantId: merchantId,
      offset: offset,
      limit: limit
    }
    return this.get(`/review/getReviewsByMerchant`, params);
  }
}
