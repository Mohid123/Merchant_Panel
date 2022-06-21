import { ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MainDeal } from 'src/app/modules/wizards/models/main-deal.model';
import SwiperCore, { FreeMode, Navigation, Thumbs } from 'swiper';
import { ConnectionService } from './../services/connection.service';

SwiperCore.use([FreeMode, Navigation, Thumbs]);

@Component({
  selector: 'app-deal-preview',
  templateUrl: './deal-preview.component.html',
  styleUrls: ['./deal-preview.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DealPreviewComponent implements OnInit {
  @Input() mainDeal: MainDeal;
  @Input() urls: any[] = [];

  noContent: boolean = false;
  thumbsSwiper: any;
  image: string =
    'https://dividealapi.dividisapp.com/media-upload/mediaFiles/placeholder/10f53b65eabd3cfbf65582cfff4eaf566.svg';

  data: MainDeal;
  subDeals: any[] = [];
  isImg: any;

  constructor(private conn: ConnectionService, private cf: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.conn.getData().subscribe((res: any) => {
      this.data = res;
      this.subDeals = this.data.vouchers ? this.data.vouchers : [];
      this.urls = this.data.mediaUrl ? this.data.mediaUrl : [];
      this.cf.detectChanges();
      if(this.urls && this.urls[0])
        this.isImg = !!(this.urls[0] as string).startsWith('data:image');
    });
  }
}
