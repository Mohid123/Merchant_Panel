import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  constructor(
    @Inject(DOCUMENT) private document: Document,
    protected override http: HttpClient,) {
    super(http);
  }

  uploadMedia(folderName: string, file:any): Observable<ApiResponse<uploadMedia>>{
    const formData: FormData = new FormData();
    formData.append('file', file);
    return this.postMedia(`/media-upload/mediaFiles/${folderName}`, formData).pipe(tap((res: ApiResponse<any>) => {
      console.log(res)
    }));
  }
}
