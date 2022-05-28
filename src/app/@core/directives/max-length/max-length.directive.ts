import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appMaxLength]'
})
export class MaxLengthDirective {

  isControlLastKey : boolean;
  @Input() length: string;

  constructor(public el: ElementRef, public renderer: Renderer2) {}

  @HostListener("keydown", ["$event"])
  onKeydown(event:any) : void {
    const value = event.target.value;
    const maxLength = parseInt(this.length);
    if (
        value &&
        !this.isControlLastKey &&
        event?.key !== 'Control' &&
        event?.key !== 'Backspace' &&
        event?.key !== 'Delete' &&
        event?.key !== 'ArrowLeft' &&
        event?.key !== 'ArrowRight' &&
        value.length > maxLength -1) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.isControlLastKey = event?.key == 'Control';
  }

    @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent):void {
      if(event?.clipboardData?.getData('text/plain')) {
        this.renderer.setProperty(
          this.el.nativeElement,
          'value',
          (this.el.nativeElement.value + event?.clipboardData?.getData('text/plain')).slice(0,+this.length)
          );
        }
      event.preventDefault();
  }

}
