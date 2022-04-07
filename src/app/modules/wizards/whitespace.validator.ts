
import { FormControl, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';

export function whitespaceValidator(form: FormControl): Observable<ValidationErrors | null> {
  return of(form.value.startsWith(" ") ? {whitespace: true} : null);
}
