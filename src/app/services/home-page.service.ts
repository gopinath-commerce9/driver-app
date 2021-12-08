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
export class HomePageService {

  constructor(
    private sharedService: SharedService,
    private restService: RestApiService,
    private permissionService: PermissionService,
    private formService: FormValidationsService
  ) { }

  public getSharedService() {
    return this.sharedService;
  }

  public allowedNotificationStatuses() {
    return [
      'pending'
    ];
  }

  public allowedDeliveryOrderStatuses() {
    return [
      'delivered'
    ];
  }

  public getNotificationList(page: number = 0, limit: number = 10) {

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
    const url = (baseUrl === '') ? '' : baseUrl + 'driver/get-recent-orders';
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

  public getDeliveredList(page: number = 0, limit: number = 10) {

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
    const url = (baseUrl === '') ? '' : baseUrl + 'driver/get-delivered-orders';
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

  public acceptDeliveryOrder(orderId = '') {

    if (orderId === undefined || orderId === '') {
      return throwError('Invalid Order Id!');
    }

    const postParams = {
      orderId: orderId.toString()
    };
    const baseUrl = this.restService.getApiUrl();
    const url = (baseUrl === '') ? '' : baseUrl + 'driver/set-order-for-delivery';
    const requestMethod = 'POST';
    const requestDataType = 'json';
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

  checkLocationEnabled(): Observable<any> {
    return new Observable((observer) => {
      this.permissionService.checkLocationEnabled().subscribe((data) => {
        observer.next(data);
      }, (err) => {
        observer.error(err);
      });
    });
  }

  gotoLocationSettings(): Observable<any> {
    return new Observable((observer) => {
      this.permissionService.gotoLocationSettings().subscribe((data) => {
        observer.next(data);
      }, (err) => {
        observer.error(err);
      });
    });
  }

  checkLocationPermissions(): Observable<any> {
    return new Observable((observer) => {
      this.permissionService.checkLocationPermission().subscribe((checkData) => {
        observer.next({
          locationPermission: true
        });
      }, (err) => {
        this.permissionService.permitLocation().subscribe((data: boolean) => {
          if (data) {
            observer.next({
              locationPermission: true,
            });
          } else {
            observer.next({
              locationPermission: false,
            });
          }
        }, (permitErr: any) => {
          observer.next({
            locationPermission: false
          });
        });
      });
    });
  }

}
