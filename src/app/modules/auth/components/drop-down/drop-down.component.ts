import { Component, forwardRef, HostListener, Input } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormGroupDirective, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.scss'],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective,
    },
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropDownComponent),
      multi: true,
    },
  ],
})
export class DropDownComponent implements ControlValueAccessor {

  @Input() title: string;
  @Input() customClass: string;
  @Input() options: any;
  @Input('value') _value: any;

  @Input() selectedValue!: string;
  isOpen: boolean;
  selected!: string;
  disabled = false;
  private onTouched!: Function;
  private onChanged!: Function;

  checkDropDown(open:boolean) {
    this.isOpen = open;
  }

  selecteOption(value: any) {
    if (this.isOpen) {
      this.onTouched();
      this.selected = value.name || value;
      this.selectedValue = value.name || value;
      this.onChanged(value.name || value);
    }
  }


  @HostListener("focusout", ["$event.target.value"])
  onBlur(value:any) {
    this.onTouched();
  }

  writeValue(value: string): void {
    this.selected = value ?? '';
  }
  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }
}
