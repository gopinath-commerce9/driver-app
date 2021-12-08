import { Injectable } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { filter, catchError, map, switchMap } from 'rxjs/operators';

import { appConfigs } from './../configs/app.configs';

import { SharedService } from './shared.service';
import { RestApiService } from './rest-api.service';
import { PermissionService } from './permission.service';
import { FormValidationsService } from './form-validations.service';

@Injectable({
  providedIn: 'root'
})
export class DeliveriesPageService {

  constructor(
    private sharedService: SharedService,
    private restService: RestApiService,
    private permissionService: PermissionService,
    private formService: FormValidationsService
  ) { }

  public getSharedService() {
    return this.sharedService;
  }

  public getDeliveryList(page: number = 0, limit: number = 10) {

    let pageClean = 0;
    if ((page !== undefined) && (page != null)) {
      pageClean = Math.round(page);
    }

    let limitClean = 10;
    if ((limit !== undefined) && (limit != null)) {
      limitClean = Math.round(limit);
    }

    const postParams = {
      page: pageClean.toString(),
      limit: limitClean.toString()
    };
    const baseUrl = this.restService.getApiUrl();
    const url = (baseUrl === '') ? '' : baseUrl + 'driver/get-delivery-orders';
    const requestMethod = 'GET';
    const requestDataType = '';
    const bearerToken = this.restService.getDeliveryBoyToken();
    const restApiObj = this.restService.processApiRequest(url, postParams, requestMethod, requestDataType, bearerToken);

    return new Observable((observer) => {
      restApiObj.subscribe((rawResult: any) => {
        const result = (this.sharedService.checkValidJson(rawResult)) ? JSON.parse(rawResult) : rawResult;
        if (result.hasOwnProperty('success') && result.hasOwnProperty('data') && (result.success === true)) {
          observer.next(result.data);
        } else {
          let errMsg = 'No Data Found!';
          if (result.hasOwnProperty('message')) {
            const errMessage = (this.sharedService.checkValidJson(result.message)) ? JSON.parse(result.message) : result.message;
            errMsg = this.sharedService.resolveErrorParameters(errMessage);
          }
          observer.error(errMsg);
        }
      }, (err) => {
        let errMessage = (this.sharedService.checkValidJson(err)) ? JSON.parse(err) : err;
        errMessage = this.sharedService.resolveErrorParameters(errMessage);
        observer.error(errMessage);
      });
    });

  }

}
