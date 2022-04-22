import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MainDeal } from './../../modules/wizards/models/main-deal.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DealService extends ApiService<any> {

  constructor(
    protected override http: HttpClient,
  ) {
    super(http);
  }

  createDeal(deal: MainDeal) {
    console.log('deal:',deal);
    console.log('deal string:',JSON.stringify(deal));

    return this.post('/deal/createDeal',deal);
  }
}
