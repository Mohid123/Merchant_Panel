
import { FormGroup } from '@angular/forms';

export function GreaterThanValidator(controlName: string, matchingControlName: string){
  return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors['confirmedValidator']) {
          return;
      }
      if(matchingControl.value) {
        if(parseFloat(matchingControl.value.toString().replace(',', '.')) && parseFloat(matchingControl.value.toString().replace(',', '.')) > 0) {
          const initialValue = parseFloat(control.value.toString().replace(',', '.'));
          const greaterValue = parseFloat(matchingControl.value.toString().replace(',', '.'));
        if (initialValue < greaterValue) {
            matchingControl.setErrors({ confirmedValidator: true });
        } else {
            matchingControl.setErrors(null);
        }
      }
    }
  }
}
