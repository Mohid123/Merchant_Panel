import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appAllowTwoDecimal]'
})
export class AllowTwoDecimalDirective {
  // Allow decimal numbers and negative values
  private regex: RegExp = new RegExp(/^\d*[\.,\,]?\d{0,2}$/g);
  position: number
  // Allow key codes for special events. Reflect :
  // Backspace, tab, end, home
  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', '-', 'ArrowLeft', 'ArrowRight', 'Del', 'Delete'];

  constructor(private el: ElementRef) {
  }
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }
    let current: string = this.el.nativeElement.value;
    this.position = this.el.nativeElement.selectionStart;
    const next: string = [current.slice(0, this.position), event.key == 'Decimal' ? (',' || '.') : event.key, current.slice(this.position)].join('');
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
    if(next.length > 5 && !next.includes(',') && !next.includes('.')) {
      event.preventDefault();
    }
    if(next.length > 8) {
      event.preventDefault();
    }
  }
}
