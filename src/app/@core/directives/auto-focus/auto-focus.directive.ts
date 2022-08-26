import { AfterViewInit, Directive, ElementRef } from '@angular/core';

@Directive({
	selector:'autofocusField'
})
export class AutoFocus implements AfterViewInit{

	constructor(
		private elementRef: ElementRef
	){}

	ngAfterViewInit(){
		this.elementRef.nativeElement.focus();
	}
}
