import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { HTTP, HTTPResponse } from '@ionic-native/http/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Observable, from, of, throwError } from 'rxjs';
import { filter, catchError, map, switchMap } from 'rxjs/operators';

import { appConfigs } from './../configs/app.configs';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class RestApiService {

  private baseUrl: string;
  private geocodingUrl: string;
  private googleApiKey: string;
  private apiVersion: string;
  private apiUsername: any;
  private apiPassword: any;
  private postParams: any;
  private authToken: string;
  private authDeviceId: string;
  private authDeviceType: string;
  private authDriverName: string;
  private dBoyToken: string;
  private mockApi = false;
  private authResponse: any;
  private userType: string;
  private customerToken: any;
  private customerEmail: any;
  private privateLocale: any = 'en_US';
  private requestTimeoutSeconds: number;
  private authLoop: number;

  constructor(
    private http: HTTP,
    private httpClient: HttpClient,
    private storage: NativeStorage,
    private sharedService: SharedService
  ) {
    console.log('Hello Rest Service');
    const apiSettings = appConfigs.api[appConfigs.env];
    this.baseUrl = apiSettings.baseUrl;
    this.geocodingUrl = apiSettings.geocodingUrl;
    this.googleApiKey = apiSettings.GoogleApiKey;
    this.apiVersion = apiSettings.version;
    this.apiUsername = apiSettings.username;
    this.apiPassword = apiSettings.password;
    this.authToken = '';
    this.authDeviceId = '';
    this.authDeviceType = '';
    this.mockApi = (apiSettings.hasOwnProperty('mockApi')) ? apiSettings.mockApi : false;
    this.requestTimeoutSeconds = 600;
    this.dBoyToken = '';
    this.authLoop = apiSettings.authRetryLoop;
  }

  public processApiRequest(
    url = '',
    params = {},
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    dataType: '' | 'json' | 'form-data' = '',
    bearerToken = ''
  ) {
    const customHttpOptions: any = {};
    if ((params !== undefined) && (params !== {})) {
      if (dataType === 'json') {
        customHttpOptions['Content-Type'] = 'application/json';
        this.http.setDataSerializer('json');
      } else if (dataType === 'form-data') {
        customHttpOptions['Content-Type'] = 'multipart/form-data';
        this.http.setDataSerializer('multipart');
      } else if (dataType === '') {
        this.http.setDataSerializer('urlencoded');
      }
    }
    if ((bearerToken !== undefined) && (bearerToken != null) && (bearerToken.trim() !== '')) {
      customHttpOptions.Authorization = 'Bearer ' + bearerToken.trim();
    }
    return new Observable((observer) => {
      this.processRestApiCall(url, params, method, customHttpOptions).subscribe((result: any) => {
        observer.next(result);
      }, (err: any) => {
        observer.error(err);
      });
    });
  }

  processUploadFilesApi(url = '', fileList = [], params = {},  bearerToken = '') {
    return new Observable((observer) => {
      if (this.sharedService.getNetworkStatus()) {
        if ((url.trim() !== undefined) && (url.trim() !== '')) {
          const urlClean = this.cleanupApiUrl(url);
          this.http.setRequestTimeout(this.requestTimeoutSeconds);
          const customHttpOptions: any = {};
          if ((bearerToken !== undefined) && (bearerToken != null) && (bearerToken.trim() !== '')) {
            customHttpOptions.Authorization = 'Bearer ' + bearerToken.trim();
          }
          let apiReqObj: Promise<HTTPResponse> = null;
          const fileObjs: any[] = [];
          const fileNmes: string[] = [];
          if (fileList.length > 0) {
            fileList.forEach((fileObj: any, fileIndex: number) => {
              if (fileObj.hasOwnProperty('file') && fileObj.hasOwnProperty('name')) {
                const currentFile: any = fileObj.file;
                const currentFilename: string = fileObj.name;
                if ((currentFile !== undefined) && (currentFile != null)) {
                  if ((currentFilename !== undefined) && (currentFilename != null) && (currentFilename.trim() !== '')) {
                    fileObjs.push(currentFile);
                    fileNmes.push(currentFilename);
                  }
                }
              }
            });
          }

          if ((fileObjs.length > 0) && (fileObjs.length === fileNmes.length)) {
            const finalObj = (fileObjs.length === 1) ? fileObjs[0] : fileObjs;
            const finalObjName = (fileNmes.length === 1) ? fileNmes[0] : fileNmes;
            apiReqObj = this.http.uploadFile(urlClean, params, customHttpOptions, finalObj, finalObjName);
          }

          if (apiReqObj === null) {
            observer.error('Invalid API Method!');
          } else {
            apiReqObj.then((response: HTTPResponse) => {
              console.log('RESTFul API Response : ', response);
              console.log(response.data);
              observer.next(response.data);
            }, (errResponse: HTTPResponse) => {
              console.log('RESTFul API Response Err : ', errResponse);
              observer.error(errResponse.error);
            }).catch((reason) => {
              console.log('RESTFul API Response Err Caught : ', reason);
              observer.error(reason);
            });
          }

        } else {
          observer.error('Invalid API URL!');
        }
      } else {
        observer.error('Oops! Internet connection has been lost.');
      }
    });
  }

  public getRetryLoopMaxCount(): number {
    return this.authLoop;
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getApiUrl(): string {
    return this.baseUrl + 'api/V' + this.apiVersion + '/';
  }

  public getAuthToken(): string {
    return this.authToken;
  }

  public getDeviceId(): string {
    return this.authDeviceId;
  }

  public getDeviceType(): string {
    return this.authDeviceType;
  }

  public getDeliveryBoyToken(): string {
    return this.dBoyToken;
  }

  public checkMockApi(): boolean {
    return this.mockApi;
  }

  public deviceAuthenticate(username: string = '', password: string = '') {

    if ((username === undefined) || (username == null) || (username.trim() === '')) {
      return throwError('Invalid API Credentials');
    }

    if ((password === undefined) || (password == null) || (password.trim() === '')) {
      return throwError('Invalid API Credentials');
    }

    const deviceDetails = this.sharedService.getDeviceDetails();
    const postData = {
      username,
      password,
      deviceName: deviceDetails.uuid
    };
    const baseUrl = this.getApiUrl();
    const url = (baseUrl === '') ? '' : baseUrl + 'drivers/login';
    const requestMethod = 'POST';
    const requestDataType = 'json';
    const restApiObj: Observable<any> = this.processApiRequest(url, postData, requestMethod, requestDataType);

    return new Observable((observer) => {
      restApiObj.subscribe((rawResult) => {
        const result = (this.sharedService.checkValidJson(rawResult)) ? JSON.parse(rawResult) : rawResult;
        if (result.hasOwnProperty('success') && result.hasOwnProperty('data') && (result.success === true)) {
          const identityData = {
            token: result.data.token,
            driverName: result.data.name,
            username,
            password,
            deviceName: deviceDetails.uuid
          };
          this.setIdentity(identityData).subscribe((idResult: any) => {
            this.authToken = identityData.token;
            this.authDriverName = identityData.driverName;
            observer.next(result);
          }, (err) => {
            observer.error(err);
          });
        } else {
          let errMsg = 'App Authentication Error!';
          if (result.hasOwnProperty('message')) {
            const errMessage = (this.sharedService.checkValidJson(result.message)) ? JSON.parse(result.message) : result.message;
            errMsg = this.sharedService.resolveErrorParameters(errMessage);
          }
          observer.error(errMsg);
        }
      }, (err) => {
        let errMsg = (this.sharedService.checkValidJson(err)) ? JSON.parse(err) : err;
        if (errMsg.hasOwnProperty('message')) {
          const errMessage = (this.sharedService.checkValidJson(errMsg.message)) ? JSON.parse(errMsg.message) : errMsg.message;
          errMsg = this.sharedService.resolveErrorParameters(errMessage);
        }
        observer.error(errMsg);
      });
    });

  }

  public deviceSignOut() {

    const deviceDetails = this.sharedService.getDeviceDetails();
    const postParams = {
      deviceName: deviceDetails.uuid
    };
    const baseUrl = this.getApiUrl();
    const url = (baseUrl === '') ? '' : baseUrl + 'logout';
    const requestMethod = 'POST';
    const requestDataType = 'json';
    const bearerToken = this.getDeliveryBoyToken();
    const restApiObj = this.processApiRequest(url, postParams, requestMethod, requestDataType, bearerToken);

    return new Observable((observer) => {
      restApiObj.subscribe((rawResult: any) => {
        const result = (this.sharedService.checkValidJson(rawResult)) ? JSON.parse(rawResult) : rawResult;
        if (result.hasOwnProperty('success') && result.hasOwnProperty('data') && (result.success === true)) {
          this.removeIdentity().subscribe((idResult: any) => {
            observer.next(result);
          }, (err) => {
            observer.error(err);
          });
        } else {
          let errMsg = 'Application Logout Error!';
          if (result.hasOwnProperty('message')) {
            const errMessage = (this.sharedService.checkValidJson(result.message)) ? JSON.parse(result.message) : result.message;
            errMsg = this.sharedService.resolveErrorParameters(errMessage);
          }
          observer.error(errMsg);
        }
      }, (err) => {
        let errMsg = (this.sharedService.checkValidJson(err)) ? JSON.parse(err) : err;
        if (errMsg.hasOwnProperty('message')) {
          const errMessage = (this.sharedService.checkValidJson(errMsg.message)) ? JSON.parse(errMsg.message) : errMsg.message;
          errMsg = this.sharedService.resolveErrorParameters(errMessage);
        }
        observer.error(errMsg);
      });
    });

  }

  public setStorageItem(itemKey = '', data): Observable<any> {
    return new Observable((observer) => {
      if (itemKey.trim().length === 0) {
        observer.error('No Index Key');
      } else {
        this.storage.setItem(itemKey.trim(), data).then((value) => {
          observer.next(value);
        }, (err) => {
          observer.error(err);
        }).catch((reason) => {
          observer.error(reason);
        });
      }
    });
  }

  public getStorageItem(itemKey = ''): Observable<any> {
    return new Observable((observer) => {
      if (itemKey.trim().length === 0) {
        observer.error('No Index Key');
      } else {
        this.storage.getItem(itemKey.trim()).then((data) => {
          observer.next(data);
        }, (err) => {
          observer.error(err);
        }).catch((reason) => {
          observer.error(reason);
        });
      }
    });
  }

  public removeStorageItem(itemKey = '') {
    return new Observable((observer) => {
      if (itemKey.trim().length === 0) {
        observer.error('No Index Key');
      } else {
        this.storage.remove(itemKey.trim()).then((value) => {
          observer.next(value);
        }, (err) => {
          observer.error(err);
        }).catch((reason) => {
          observer.error(reason);
        });
      }
    });
  }

  public setIdentity(data: any) {
    if ((data === undefined) || (data == null)) {
      return throwError('Invalid Data for Identity');
    }
    return this.setStorageItem('identity', btoa(JSON.stringify(data))).pipe(
      map((result: any) => {
        if (data.hasOwnProperty('token') && (data.token !== undefined) && (data.token != null)) {
          this.setDeliveryBoyToken(data.token);
        }
        return result;
      }),
      catchError((err: any) => {
        this.setDeliveryBoyToken('');
        throw new Error(err);
      })
    );
  }

  public getIdentity() {
    return new Observable((observer) => {
      this.getStorageItem('identity').subscribe((result: any) => {
        const decodedData = atob(result);
        const parsedData = JSON.parse(decodedData);
        if (parsedData.hasOwnProperty('token') && (parsedData.token !== undefined) && (parsedData.token != null)) {
          this.setDeliveryBoyToken(parsedData.token);
        }
        observer.next(JSON.parse(decodedData));
      }, (err) => {
        observer.error(err);
      });
    });
  }

  public removeIdentity() {
    return this.removeStorageItem('identity').pipe(
      map((result: any) => {
        this.setDeliveryBoyToken('');
        return result;
      }),
      catchError((err: any) => {
        throw new Error(err);
      })
    );
  }

  private cleanupApiUrl(url: string = '') {
    let cleanUrl = '';
    if ((url !== undefined) && (url != null) && (url.trim() !== '')) {
      /* cleanUrl = url.trim().replace(' ', '%20'); */
      cleanUrl = url.trim().split(' ').join('%20');
    }
    return cleanUrl;
  }

  private setDeliveryBoyToken(token = '') {
    this.dBoyToken = token;
  }

  private processRestApiCall(url = '', params = {}, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', headerOptions = {}) {
    return new Observable((observer) => {
      if (this.sharedService.getNetworkStatus()) {
        if ((url.trim() !== undefined) && (url.trim() !== '')) {
          const urlClean = this.cleanupApiUrl(url);
          this.http.setRequestTimeout(this.requestTimeoutSeconds);
          let apiReqObj: Promise<HTTPResponse> = null;
          if (method === 'GET') {
            apiReqObj = this.http.get(urlClean, params, headerOptions);
          } else if (method === 'POST') {
            apiReqObj = this.http.post(urlClean, params, headerOptions);
          } else if (method === 'PUT') {
            apiReqObj = this.http.put(urlClean, params, headerOptions);
          } else if (method === 'DELETE') {
            apiReqObj = this.http.delete(urlClean, params, headerOptions);
          }

          if (apiReqObj === null) {
            observer.error('Invalid API Method!');
          } else {
            apiReqObj.then((response: HTTPResponse) => {
              console.log('RESTFul API Response : ', response);
              observer.next(response.data);
            }, (errResponse: HTTPResponse) => {
              console.log('RESTFul API Response Err : ', errResponse);
              observer.error(errResponse.error);
            }).catch((reason) => {
              console.log('RESTFul API Response Err Caught : ', reason);
              observer.error(reason);
            });
          }

        } else {
          observer.error('Invalid API URL!');
        }
      } else {
        observer.error('Oops! Internet connection has been lost.');
      }
    });
  }

}
