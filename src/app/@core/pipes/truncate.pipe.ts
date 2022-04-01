import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, maxLength: number) {
    if(value.length > 14) {
      return value.substring(0, maxLength) + '...';
    }
    else {
      return value;
    }

  }

}
