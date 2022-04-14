import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeformate'
})
export class TimeformatePipe implements PipeTransform {

  transform(value: string,endDate:boolean): string {
    if (value){
      const date = new Date(value);
      var strArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var d = endDate ? date.getDate() -1 : date.getDate();
      var m = strArray[date.getMonth()];
      var y = date.getFullYear();
      return '' + (d <= 9 ? '0' + d : d) + ' ' + m + ' ' + y;
    }
    else
      return ''
  }

}
