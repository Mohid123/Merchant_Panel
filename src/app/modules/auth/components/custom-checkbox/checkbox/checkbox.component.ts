import { Component, Host, Input } from '@angular/core';
import { CustomCheckboxComponent } from '../custom-checkbox.component';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent  {

  @Input() value: string;
  @Input() customClass: string;
  @Input() name: string;
  @Input() disabled: any;

  constructor(@Host() public customCheckbox: CustomCheckboxComponent) { }

}
