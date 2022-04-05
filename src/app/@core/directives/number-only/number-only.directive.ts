import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {

  constructor() { }

  @HostListener('keypress') onkeypress(e:any){
    let event = e || window.event;
    if(event){
      return this.isNumberKey(event);
    }
  }

isNumberKey(event: any){
 let charCode = (event.which) ? event.which : event.keyCode;
 if (charCode > 31 && (charCode < 48 || charCode > 57)){
    return false;
 }
 return true;
}

}
