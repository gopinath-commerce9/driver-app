import { Injectable } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { filter, catchError, map, switchMap } from 'rxjs/operators';
import { CallNumber } from '@ionic-native/call-number/ngx';

import { appConfigs } from './../configs/app.configs';

import { SharedService } from './shared.service';
import { RestApiService } from './rest-api.service';
import { PermissionService } from './permission.service';
import { FormValidationsService } from './form-validations.service';

@Injectable({
  providedIn: 'root'
})
export class OrderSelectorPageService {

  constructor(
    private sharedService: SharedService,
    private restService: RestApiService,
    private permissionService: PermissionService,
    private formService: FormValidationsService,
    private callNumber: CallNumber
  ) { }

  public getSharedService() {
    return this.sharedService;
  }

  public getOrderDetails(orderId = '') {

    if (orderId === undefined || orderId === '') {
      return throwError('Invalid Order Id!');
    }

    const postParams = {
      orderId: orderId.toString(),
      orderState: 'pickup'
    };
    const baseUrl = this.restService.getApiUrl();
    const url = (baseUrl === '') ? '' : baseUrl + 'driver/get-order-details';
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

  makeCall(phoneNumber: string = '') {
    return new Observable((observer) => {
      if (phoneNumber.trim() !== '') {
        this.callNumber.callNumber(phoneNumber, false).then((res) => {
          observer.next(true);
        }, (err) => {
          observer.error(err);
        }).catch((reason) => {
          observer.error(reason);
        });
      } else {
        observer.error(new Error('Phone number entry is empty!'));
      }
    });
  }

}
