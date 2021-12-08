import { Injectable } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { filter, catchError, map, switchMap } from 'rxjs/operators';

import { SharedService } from './shared.service';
import { RestApiService } from './rest-api.service';
import { PermissionService } from './permission.service';
import { FormValidationsService } from './form-validations.service';

@Injectable({
  providedIn: 'root'
})
export class LoginPageService {

  constructor(
    private sharedService: SharedService,
    private restService: RestApiService,
    private permissionService: PermissionService,
    private formService: FormValidationsService
  ) {}

  public getSharedService() {
    return this.sharedService;
  }

  public customerLogin(username = '', password = ''): Observable<any> {

    if (username.trim() === undefined || username.trim() === '') {
      return throwError('Invalid Login Credentials');
    }

    if (password.trim() === undefined || password.trim() === '') {
      return throwError('Invalid Login Credentials');
    }

    return new Observable((observer) => {
      this.restService.deviceAuthenticate(username.trim(), password.trim()).subscribe((result: any) => {
        observer.next(result);
      }, (err: any) => {
        let errMessage = (this.sharedService.checkValidJson(err)) ? JSON.parse(err) : err;
        errMessage = this.sharedService.resolveErrorParameters(errMessage);
        observer.error(errMessage);
      });
    });

  }

}
