import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appNumbersOnly]'
})
export class NumbersOnlyDirective {

  constructor(public el: ElementRef, public renderer: Renderer2) { }

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

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent):void {
    if(event?.clipboardData?.getData('text/plain')) {
      this.renderer.setProperty(
        this.el.nativeElement,
        'value',
        (this.el.nativeElement.value + event?.clipboardData?.getData('text/plain'))
        .slice(0, 5)
        .replace(',', '.')
        .replace(/[^\d.]/g, '')
        .replace(/\./, "x")
        .replace(/\./g, "")
        .replace(/x/, "."))
      }
    event.preventDefault();
  }

}
