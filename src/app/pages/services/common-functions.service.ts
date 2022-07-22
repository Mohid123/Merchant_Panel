import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class CommonFunctionsService {

  getUniqueListBy(arr: any, key: any) {
    return [...new Map(arr.map((item: any) => [item[key], item])).values()]
  }
}
