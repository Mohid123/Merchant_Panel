import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { MediaUpload } from '../models/requests/media-upload.model';
import { ResponseAddMedia } from '../models/response-add-media.model';
import { ApiResponse } from '../models/response.model';
import { ApiService } from './api.service';

type uploadMedia = MediaUpload | ResponseAddMedia | any;
@Injectable({
  providedIn: 'root'
})
export class MediaService extends ApiService<uploadMedia> {

  private mediaForm:any = null;
  public fileFormData = new FormData();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    protected override http: HttpClient,) {
    super(http);

    this.mediaForm = new FormGroup({
      file: new FormControl('')
    });
  }

  uploadMedia(folderName: string, file:any): Observable<ApiResponse<uploadMedia>>{
    if(this.fileFormData.has('file')) {
      this.fileFormData.delete('file');
    }

    this.mediaForm.patchValue({file: file });
    this.fileFormData.append('file', this.mediaForm.get('file').value);

    return this.postMedia(`/media-upload/mediaFiles/${folderName}`, this.fileFormData).pipe(take(1),tap((result:ApiResponse<uploadMedia>)=>{
      if (result.hasErrors()) {
        console.log('media-upload success');
        // this.toastrService.error(result?.errors[0]?.error?.message)
      }
    }))
  }
}
