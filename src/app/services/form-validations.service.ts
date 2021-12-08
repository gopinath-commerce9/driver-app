import { Injectable } from '@angular/core';
import { AbstractControl, FormControl, ValidatorFn } from '@angular/forms';

import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class FormValidationsService {

  constructor(private sharedService: SharedService) { }

  static isNotEmpty(fc: FormControl) {
    const givenValue = fc.value;
    if (
      (givenValue === undefined)
      || (givenValue == null)
      || ((typeof givenValue === 'number') && (givenValue <= 0))
      || ((typeof givenValue === 'string') && (givenValue.trim() === ''))
    ) {
      return {
        isNotEmpty: true
      };
    } else {
      return null;
    }
  }

  static customMinLength(limit: number) {
    return (fc: FormControl) => {
      const givenValue = String(fc.value);
      if (
        (givenValue !== undefined)
        && (givenValue != null)
        && (limit !== undefined)
        && (limit != null)
        && (limit > 0)
        && (givenValue.length >= limit)
      ) {
        return null;
      } else {
        return {
          customMinLength: true,
        };
      }
    };
  }

  static customMaxLength(limit: number) {
    return (fc: FormControl) => {
      const givenValue = String(fc.value);
      if (
        (givenValue !== undefined)
        && (givenValue != null)
        && (limit !== undefined)
        && (limit != null)
        && (limit > 0)
        && (givenValue.length <= limit)
      ) {
        return null;
      } else {
        return {
          customMaxLength: true,
        };
      }
    };
  }

  static customExactLength(limit: number) {
    return (fc: FormControl) => {
      const givenValue = String(fc.value);
      if (
        (givenValue !== undefined)
        && (givenValue != null)
        && (limit !== undefined)
        && (limit != null)
        && (limit > 0)
        && (givenValue.length === limit)
      ) {
        return null;
      } else {
        return {
          customExactLength: true,
        };
      }
    };
  }

  static passwordSectionEmpty(comparePassword1: AbstractControl, comparePassword2: AbstractControl): ValidatorFn {
    return (currentPassword: AbstractControl) => {
      if (
        (currentPassword.value.trim() === '')
        && (comparePassword1.value.trim() === '')
        && (comparePassword2.value.trim() === '')
      ) {
        comparePassword1.setErrors(null);
        comparePassword2.setErrors(null);
        return null;
      } else if (
        (currentPassword.value.trim() !== '')
        && (comparePassword1.value.trim() !== '')
        && (comparePassword2.value.trim() !== '')
      ) {
        if (comparePassword1.hasError('passwordSectionEmpty')) {
          const comparePass1Errors = comparePassword1.errors;
          if (comparePass1Errors.hasOwnProperty('passwordSectionEmpty')) {
            delete comparePass1Errors.passwordSectionEmpty;
            comparePassword1.setErrors(comparePass1Errors);
          }
        }
        if (comparePassword2.hasError('passwordSectionEmpty')) {
          const comparePass2Errors = comparePassword2.errors;
          if (comparePass2Errors.hasOwnProperty('passwordSectionEmpty')) {
            delete comparePass2Errors.passwordSectionEmpty;
            comparePassword1.setErrors(comparePass2Errors);
          }
        }
        return null;
      } else {
        if (comparePassword1.value.trim() === '') {
          if (!comparePassword1.hasError('passwordSectionEmpty')) {
            comparePassword1.setErrors({
              passwordSectionEmpty: true
            });
            comparePassword1.markAsDirty();
          }
        }
        if (comparePassword2.value.trim() === '') {
          if (!comparePassword2.hasError('passwordSectionEmpty')) {
            comparePassword2.setErrors({
              passwordSectionEmpty: true
            });
            comparePassword2.markAsDirty();
          }
        }
        if (currentPassword.value.trim() === '') {
          return {
            passwordSectionEmpty: true
          };
        } else {
          return null;
        }
      }
    };
  }

  static passwordMismatch(comparePassword: AbstractControl): ValidatorFn {
    let subscribe = false;
    return (currentPassword: AbstractControl) => {
      if (!subscribe) {
        subscribe = true;
        comparePassword.valueChanges.subscribe(() => {
          currentPassword.updateValueAndValidity();
        });
      }
      if (currentPassword.value !== '') {
        if (currentPassword.value !== comparePassword.value) {
          return {
            passwordMismatch: true
          };
        } else {
          return null;
        }
      } else {
        return null;
      }
    };
  }

}
