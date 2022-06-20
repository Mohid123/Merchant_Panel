import { Component, forwardRef, Input } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormGroupDirective, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-category-radio-button',
  templateUrl: './category-radio-button.component.html',
  styleUrls: ['./category-radio-button.component.scss'],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective
    }
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CategoryRadioButtonComponent),
      multi: true
    }
  ]
})
export class CategoryRadioButtonComponent  implements ControlValueAccessor {


  @Input() customClass: string;
  @Input() name: string;
  @Input('value') _value: any;

  get value() {
    return this._value;
  }

  set value(value) {
    if (!!value) {
      this._value = value;
      this.onChange(value);
      this.onTouched();
    }
  }

  onChange: any = (onchanges:any) => {};

  onTouched: any = () => {};

  registerOnChange(fn:any) {
    this.onChange = fn;
  }

  registerOnTouched(fn:any) {
    this.onTouched = fn;
  }

  writeValue(value:any) {
    this._value = value;
  }

  toggleChange(event:any) {
    // console.log(event.target.value);
    // Is a mapping here necessary to assign the outer ngModel bound
    // property it's new value??
  }


}
