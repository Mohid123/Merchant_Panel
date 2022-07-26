import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class CommonFunctionsService {

  public finished: boolean;
  public optionsLengthIsZero: boolean

  getUniqueListBy(arr: any, key: any) {
    return [...new Map(arr.map((item: any) => [item[key], item])).values()]
  }
}
