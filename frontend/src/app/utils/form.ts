import {FormControl, FormGroup} from '@angular/forms';
import {combineLatest, of} from 'rxjs';
import {map} from 'rxjs/operators';

export function checkIfFormPassesValidation(formGroup: FormGroup) {
  const syncValidationErrors = Object.keys(formGroup.controls).map(c => {
    const control = formGroup.controls[c];
    return !control.validator ? null : control.validator(control);
  }).filter(errors => !!errors);
  return combineLatest(Object.keys(formGroup.controls).map(c => {
    const control = formGroup.controls[c];
    return !control.asyncValidator ? of(null) : control.asyncValidator(control);
  })).pipe(
    map(asyncValidationErrors => {
      const hasErrors = [...syncValidationErrors, ...asyncValidationErrors.filter(errors => !!errors)].length;
      if (hasErrors) { // ensure errors display in UI...
        Object.keys(formGroup.controls).forEach(key => {
          formGroup.controls[key].markAsTouched();
          formGroup.controls[key].updateValueAndValidity();
        });
      }
      return !hasErrors;
    })).toPromise();
}
