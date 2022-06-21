import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string | any, maxLength: number) {
    if(value.length > 50) {
      return value.substring(0, maxLength) + '...';
    }
    else {
      return value;
    }

  }

}
