import { Component, ElementRef, forwardRef, ViewChild } from "@angular/core";
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR
} from "@angular/forms";

@Component({
  selector: 'app-custom-checkbox',
  templateUrl: './custom-checkbox.component.html',
  styleUrls: ['./custom-checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomCheckboxComponent),
      multi: true
    }
  ]
})
export class CustomCheckboxComponent implements ControlValueAccessor {
  value: string[] = [];

  @ViewChild('myInput') myInput: ElementRef;

  constructor() { }

  onChange = (value: string[]) => {};
  onTouch = () => {};

  // Sets value to the component
  writeValue(value: string[]): void {
    this.value = value;
  }

  // reference for the change function
  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  // reference for the touched function
  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  toggleValue(selectedValue: string) {
    const index = this.value.indexOf(selectedValue);

    if (index > -1) {
      this.value = [
        ...this.value.slice(0, index),
        ...this.value.slice(index + 1),
      ];
    }
    else if(this.value.length > 2) {
      this.myInput?.nativeElement.disabled();
    }
    else {
      this.value = [...this.value, selectedValue];
    }

    this.onChange(this.value);
    this.onTouch();
  }

  isSelected(valueToCheck: string) {
    return this.value.includes(valueToCheck);
  }

}
