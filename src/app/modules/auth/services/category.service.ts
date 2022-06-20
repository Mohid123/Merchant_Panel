import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiResponse } from '@core/models/response.model';
import { ApiService } from '@core/services/api.service';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { CategoryList } from '../models/category-list.model';

type category = CategoryList
@Injectable({
  providedIn: 'root'
})
export class CategoryService extends ApiService<category> {

  constructor(protected override http: HttpClient) {
    super(http);
  }

  getAllCategories(offset: any, limit: any): Observable<ApiResponse<category>> {
    const params: any = {
      offset: offset,
      limit: limit
    }
    return this.get(`/category/getAllCategories`, params).pipe(take(1), tap((res: ApiResponse<any>) => {
      console.log(res);
    }))
  }

  getSubCategories(offset: any, limit: any): Observable<ApiResponse<any>> {
    const params: any = {
      offset: offset,
      limit: limit
    }
    return this.get(`/category/getAllSubCategoriesByMerchant`, params).pipe(take(1), tap((res: ApiResponse<any>) => {
      console.log(res);
    }));
  }

  getAllCategoriesDetail(offset: any, limit: any): Observable<ApiResponse<any>> {
    const params: any = {
      offset: offset,
      limit: limit
    }
    return this.get(`/category/getAllSubCategoriesByCategories`, params).pipe(take(1), tap((res: ApiResponse<any>) => {
      console.log(res);
    }));
  }
}
