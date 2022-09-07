import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiResponse } from '@core/models/response.model';
import { DealService } from '@core/services/deal.service';
import { Subject } from 'rxjs';
import SwiperCore, { FreeMode, Navigation, Thumbs } from 'swiper';

SwiperCore.use([FreeMode, Navigation, Thumbs]);

@Component({
  selector: 'app-preview-deal',
  templateUrl: './preview-deal.component.html',
  styleUrls: ['./preview-deal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PreviewDealComponent implements OnInit {
  dealId: string;
  dealData: any;
  destroy$ = new Subject();
  imageArray: any[] = [];
  subDeals: any[] = [];
  thumbsSwiper: any
  Arr = Array;
  num: number = 10;
  dataLoading: boolean = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private dealService: DealService,
    private cf: ChangeDetectorRef
    ) { }

  ngOnInit(): void {
    this.getID()
    .then(() => {
      this.getDealByID()
    })
    .catch((err) => {
      throw new Error(err)
    })
  }

  async getID() {
     this.dealId = await this.activatedRoute.snapshot.params['dealId'];
     return this.dealId
  }

  getDealByID() {
    this.dataLoading = true;
    if(this.dealId) {
      this.dealService.getDealByIDNew(this.dealId).subscribe((res: ApiResponse<any>) => {
        if(!res.hasErrors()) {
          this.dealData = res.data;
          this.imageArray = [];
          const imagesOnly = this.dealData.mediaUrl.filter((value: any) => {
            if(value.type == 'Image') {
              return value
            }
          })
          this.imageArray.push(...imagesOnly);
          if(this.imageArray.length > 11) {
            this.imageArray.pop();
            this.cf.detectChanges();
          }
          this.subDeals = this.dealData.subDeals;
          this.cf.detectChanges();
          this.dataLoading = false;
          this.cf.detectChanges()
        }
      })
    }
  }

}
