import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncation'
})
export class TruncationPipe implements PipeTransform {

  transform(value: string, maxLength: number) {
    if(value.length > 50) {
      return value.substring(0, maxLength) + '...';
    }
    else {
      return value;
    }

  }

}
