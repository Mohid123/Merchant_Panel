import { Injectable } from '@angular/core';
import { DealService } from '@core/services/deal.service';

@Injectable({
  providedIn: 'root'
})

export class CommonFunctionsService {

  constructor(private dealService: DealService) { }

  public finished: boolean;
  public optionsLengthIsZero: boolean;

  getUniqueListBy(arr: any, key: any) {
    return [...new Map(arr.map((item: any) => [item[key], item])).values()]
  }

  deleteDealByID(dealID: string) {
    this.dealService.deleteDeal(dealID).subscribe();
  }
}
