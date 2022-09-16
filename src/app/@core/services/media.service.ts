import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { EventEmitter, Inject, Injectable, Output } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MediaUpload } from '../models/requests/media-upload.model';
import { ResponseAddMedia } from '../models/response-add-media.model';
import { ApiResponse } from '../models/response.model';
import { ApiService } from './api.service';

type uploadMedia = MediaUpload | ResponseAddMedia | any;
@Injectable({
  providedIn: 'root'
})
export class MediaService extends ApiService<uploadMedia> {

  dataCount: BehaviorSubject<number> = new BehaviorSubject(0);
  dataCount$: Observable<number> = this.dataCount.asObservable();
  totalCount: BehaviorSubject<number> = new BehaviorSubject(0);
  totalCount$: Observable<number> = this.totalCount.asObservable();
  @Output() valueChanged: EventEmitter<number> = new EventEmitter<number>();
  uploadInProgress: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  uploadInProgress$: Observable<boolean> = this.uploadInProgress.asObservable();
  afterUpload: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  afterUpload$: Observable<boolean> = this.afterUpload.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    protected override http: HttpClient,) {
    super(http);
  }

  uploadMedia(folderName: string, file:any): Observable<ApiResponse<uploadMedia>>{
    if(file.type == 'video/mp4' || file.type == 'video/flv') {
      this.uploadInProgress.next(false);
    }
    else {
      this.uploadInProgress.next(true);
    }
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.postMedia(`/media-upload/mediaFiles/${folderName}`, formData).pipe(tap((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        if(!res.data.url.endsWith('.mp4')) {
          let value = this.dataCount.value;
          this.dataCount.next(value - 1);
          this.valueChanged.emit(this.dataCount.value);
          if(this.dataCount.value == 0) {
            this.uploadInProgress.next(false);
            this.afterUpload.next(false);
            this.valueChanged.emit(0);
          }
        }
      }
    }));
  }

  uploadMediaOtherThanDeal(folderName: string, file:any): Observable<ApiResponse<uploadMedia>> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.postMedia(`/media-upload/mediaFiles/${folderName}`, formData).pipe(tap((res: ApiResponse<any>) => {
      if(!res.hasErrors()) {
        console.log(res)
      }
    }))
  }

  public subscribeToProgressEvents(subscribeFn: (x: number) => any): void {
    this.valueChanged.subscribe(subscribeFn);
  }
}
