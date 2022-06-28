import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MainDeal } from 'src/app/modules/wizards/models/main-deal.model';
import SwiperCore, { FreeMode, Navigation, Thumbs } from 'swiper';
import { SwiperComponent } from 'swiper/angular';
import { VideoProcessingService } from '../services/video-to-img.service';
import { ConnectionService } from './../services/connection.service';

SwiperCore.use([FreeMode, Navigation, Thumbs]);

@Component({
  selector: 'app-deal-preview',
  templateUrl: './deal-preview.component.html',
  styleUrls: ['./deal-preview.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DealPreviewComponent implements OnInit, OnDestroy {
  mainDeal: MainDeal;
  @Input() urls: any[] = [];

  noContent: boolean = false;
  @ViewChild('swipe') swipe: SwiperComponent;
  thumbsSwiper: any;
  image: string =
    'https://dividealapi.dividisapp.com/media-upload/mediaFiles/placeholder/10f53b65eabd3cfbf65582cfff4eaf566.svg';

  subDeals: any[] = [];
  isImg: any;
  video: any[] = [];
  images: any[] = [];
  videoType: any;
  unsubscribe = new Subject();

  constructor(private conn: ConnectionService, private cf: ChangeDetectorRef, private videoService: VideoProcessingService) {}

  ngOnInit(): void {
    this.conn.getData().pipe(takeUntil(this.unsubscribe)).subscribe((res: any) => {
      this.mainDeal = res;
      this.subDeals = this.mainDeal.vouchers ? this.mainDeal.vouchers : [];
      this.urls = this.mainDeal.mediaUrl ? this.mainDeal.mediaUrl.filter(img => img.startsWith('data:image')) : [];
      this.cf.detectChanges();
    });
  }


  ngOnDestroy() {
    this.unsubscribe.complete();
    this.unsubscribe.unsubscribe();
  }

}
