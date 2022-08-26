import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
	selector:'autofocusField'
})
export class AutoFocus implements AfterViewInit{

	constructor(
		private elementRef: ElementRef
	){}

	ngAfterViewInit(){
    debugger
		this.elementRef.nativeElement.focus();
	}
}
