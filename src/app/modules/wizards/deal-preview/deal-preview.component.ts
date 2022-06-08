import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MainDeal } from 'src/app/modules/wizards/models/main-deal.model';
import SwiperCore, { FreeMode, Navigation, Thumbs } from "swiper";

SwiperCore.use([FreeMode, Navigation, Thumbs]);

@Component({
  selector: 'app-deal-preview',
  templateUrl: './deal-preview.component.html',
  styleUrls: ['./deal-preview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DealPreviewComponent implements OnInit {

  @Input() mainDeal: MainDeal;
  @Input() subDeals: any[] = [];
  @Input() urls: any[] = [];

  noContent: boolean = false;
  thumbsSwiper: any;
  image: string = "https://dividealapi.dividisapp.com/media-upload/mediaFiles/placeholder/10f53b65eabd3cfbf65582cfff4eaf566.svg"

  constructor() { }

  ngOnInit(): void {
  }

}
