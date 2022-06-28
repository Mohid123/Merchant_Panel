import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VideoProcessingService {


  maxWidth = 151;
  maxHeight = 127;

  constructor(@Inject(DOCUMENT) private document: Document, private http: HttpClient) { }


  public generateThumbnail(videoFile: Blob, imageName: any): Promise<any> {
    const video: HTMLVideoElement = this.document.createElement('video');
    const canvas: HTMLCanvasElement = this.document.createElement('canvas');
    const canvasCompressImage: HTMLCanvasElement = document.createElement('canvas');
    const context: CanvasRenderingContext2D | any = canvas.getContext('2d');
    const contextCompressImage: CanvasRenderingContext2D | any = canvasCompressImage.getContext('2d');
    return new Promise<any>((resolve, reject) => {
      canvas.addEventListener('error', reject);
      video.addEventListener('error', reject);
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = Math.round(video.duration / 2);
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      });
      video.addEventListener('canplay', event => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        var img = new Image();
        img.src = canvas.toDataURL();
        img.onload = () => {
          let newSize = this.calculateAspectRatioFit(img?.width, img?.height);
          canvasCompressImage.width = newSize.width;
          canvasCompressImage.height = newSize.height;
          contextCompressImage.drawImage(img, 0, 0, img.width, img.height, 0, 0, newSize.width, newSize.height);
          resolve(this.dataURLtoFile(canvasCompressImage.toDataURL(), 'thumbnail.jpg'));
        }
      });
      if (videoFile.type) {
        video.setAttribute('type', videoFile.type);
      }
      video.preload = 'auto';
      video.src = window.URL.createObjectURL(videoFile);
      video.load();
    });
  }

  calculateAspectRatioFit(srcWidth: any, srcHeight: any): { width: number, height: number } {
    var ratio = Math.min(this.maxWidth / srcWidth, this.maxHeight / srcHeight);
    return { width: srcWidth * ratio, height: srcHeight * ratio };
  }

  async dataURLtoFile(dataurl: any, filename: any) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

}
