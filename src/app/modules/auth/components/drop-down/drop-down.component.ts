import { Component, forwardRef, Input } from '@angular/core';
import { ControlContainer, ControlValueAccessor, FormGroupDirective, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-drop-down',
  templateUrl: './drop-down.component.html',
  styleUrls: ['./drop-down.component.scss'],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective
    }
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropDownComponent),
      multi: true
    }
  ]
})
export class DropDownComponent implements ControlValueAccessor {

  @Input() title: string;
  @Input() customClass: string;
  @Input() options: any;
  @Input('value') _value: any;

  selectedValue !: string;
  selected!: string;
  disabled = false;
  private onTouched!: Function;
  private onChanged!: Function;

  selecteOption(value: any) {
    this.onTouched();
    this.selected = value.id;
    this.selectedValue = value.name;
    this.onChanged(value.id);
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
