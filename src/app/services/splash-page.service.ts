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
export class SplashPageService {

  constructor(
    private sharedService: SharedService,
    private restService: RestApiService,
    private permissionService: PermissionService,
    private formService: FormValidationsService
  ) {}

  public getSharedService() {
    return this.sharedService;
  }

  public isDriverSignedIn(): Observable<boolean> {
    return new Observable((observer) => {
      this.restService.getIdentity().subscribe((result) => {
        observer.next(true);
      }, (err) => {
        observer.next(false);
      });
    });
  }

}
