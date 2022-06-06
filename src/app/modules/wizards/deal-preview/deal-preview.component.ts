import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import SwiperCore, { FreeMode, Navigation, Thumbs } from "swiper";

SwiperCore.use([FreeMode, Navigation, Thumbs]);

@Component({
  selector: 'app-deal-preview',
  templateUrl: './deal-preview.component.html',
  styleUrls: ['./deal-preview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DealPreviewComponent implements OnInit {
  noContent: boolean = false;
  thumbsSwiper: any;
  images: any[] = [
    "https://swiperjs.com/demos/images/nature-1.jpg",
    "https://swiperjs.com/demos/images/nature-2.jpg",
    "https://swiperjs.com/demos/images/nature-3.jpg",
    "https://swiperjs.com/demos/images/nature-4.jpg",
    "https://swiperjs.com/demos/images/nature-5.jpg",
    "https://swiperjs.com/demos/images/nature-6.jpg",
    "https://swiperjs.com/demos/images/nature-7.jpg",
    "https://swiperjs.com/demos/images/nature-8.jpg",
    "https://images.pexels.com/photos/3493777/pexels-photo-3493777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://swiperjs.com/demos/images/nature-10.jpg"
  ]

  constructor() { }

  ngOnInit(): void {
  }

}
