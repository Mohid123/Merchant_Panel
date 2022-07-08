import { FormGroup } from '@angular/forms';

export function UrlValidator(controlName: string){
  return (formGroup: FormGroup) => {
      const http = 'http';
      const https = 'https';
      const www = 'www';
      const pattern = '[a-z]+\\.[a-z]{2,4}$';
      const control = formGroup.controls[controlName];
      if (control.errors && !control.errors['invalidUrl']) {
        return;
      }
      if(!control.value.startsWith(http) && !control.value.startsWith(https) && !control.value.startsWith(www) || !control.value.match(pattern)) {
        control.setErrors({ invalidUrl: true });
      }
  }
}