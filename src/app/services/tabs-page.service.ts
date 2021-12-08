import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { timeout, switchMap, map, mergeMap, concatMap, catchError, delay, tap } from 'rxjs/operators';

import { TabItemInterface } from './../interfaces/tab-item';

import { SharedService } from './shared.service';
import { RestApiService } from './rest-api.service';
import { PermissionService } from './permission.service';
import { FormValidationsService } from './form-validations.service';

import { HomePageModule } from './../pages/home/home.module';
import { HomePage } from './../pages/home/home.page';
import { NotificationsPageModule } from './../pages/notifications/notifications.module';
import { NotificationsPage } from './../pages/notifications/notifications.page';
import { DeliveriesPageModule } from './../pages/deliveries/deliveries.module';
import { DeliveriesPage } from './../pages/deliveries/deliveries.page';
import { AccountPageModule } from './../pages/account/account.module';
import { AccountPage } from './../pages/account/account.page';

@Injectable({
  providedIn: 'root'
})
export class TabsPageService {

  private appStartUrls: Array<string> = [];
  private exceptionUrls: Array<string> = [];
  private tabItems: Array<TabItemInterface> = [];

  constructor(
    private sharedService: SharedService,
    private restService: RestApiService,
    private permissionService: PermissionService,
    private formService: FormValidationsService
  ) {
    this.setAppStartUrls();
    this.setExceptionalUrls();
    this.setTabItems();
  }

  public static prepareTabItems(): Array<TabItemInterface> {
    return [{
      title: 'Home', tabName: 'Home', tabComponent: HomePage, tabUrl: 'home',
      moduleClassName: 'HomePageModule', modulePath: 'home/home.module', moduleClass: HomePageModule,
      index: 0, icon: 'home'
    }, {
      title: 'Notifications', tabName: 'Notifications', tabComponent: NotificationsPage, tabUrl: 'notifications',
      moduleClassName: 'NotificationsPageModule', modulePath: 'notifications/notifications.module', moduleClass: NotificationsPageModule,
      index: 2, icon: 'notifications'
    }, {
      title: 'Deliveries', tabName: 'Deliveries', tabComponent: DeliveriesPage, tabUrl: 'deliveries',
      moduleClassName: 'DeliveriesPageModule', modulePath: 'deliveries/deliveries.module', moduleClass: DeliveriesPageModule,
      index: 2, icon: 'car'
    }, {
      title: 'My Account', tabName: 'MyAccount', tabComponent: AccountPage, tabUrl: 'account',
      moduleClassName: 'AccountPageModule', modulePath: 'account/account.module', moduleClass: AccountPageModule,
      index: 3, icon: 'person-circle'
    }];
  }

  public getAppStartUrls(): Array<string> {
    return this.appStartUrls;
  }

  public getExceptionalUrls(): Array<string> {
    return this.exceptionUrls;
  }

  public getTabItems(): Array<TabItemInterface> {
    return this.tabItems;
  }

  public getSharedService() {
    return this.sharedService;
  }

  sendOneSignalPlayerId(playerId: any = null) {

    if ((playerId === undefined) || (playerId == null)) {
      return throwError('Invalid OneSignal Player Id!');
    }

    const postParams = {
      playerId
    };
    const baseUrl = this.restService.getApiUrl();
    const url = (baseUrl === '') ? '' : baseUrl + 'set-onesignal-player-id';
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
          let errMsg = 'Something went wrong!';
          if (result.hasOwnProperty('message')) {
            errMsg = result.message;
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

  sendFirebaseTokenId(tokenId: any = null) {

    if ((tokenId === undefined) || (tokenId == null)) {
      return throwError('Invalid Firebase Token!');
    }

    const postParams = {
      tokenId
    };
    const baseUrl = this.restService.getApiUrl();
    const url = (baseUrl === '') ? '' : baseUrl + 'set-firebase-token-id';
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
          let errMsg = 'Something went wrong!';
          if (result.hasOwnProperty('message')) {
            errMsg = result.message;
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

  sendUserLocation(latitude: number = null, longitude:  number = null) {

    if ((latitude === undefined) || (latitude == null)) {
      return throwError('Invalid Location Coordinate!');
    }

    if ((longitude === undefined) || (longitude == null)) {
      return throwError('Invalid Location Coordinate!');
    }

    const postParams = {
      latitude,
      longitude,
    };
    const baseUrl = this.restService.getApiUrl();
    const url = (baseUrl === '') ? '' : baseUrl + 'set-user-location-coords';
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
          let errMsg = 'Something went wrong!';
          if (result.hasOwnProperty('message')) {
            errMsg = result.message;
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

  public diverSignOut(): Observable<boolean> {
    return new Observable((observer) => {
      this.restService.deviceSignOut().subscribe((result) => {
        observer.next(true);
      }, (err) => {
        observer.next(false);
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
        }, (permitErr) => {
          observer.next({
            locationPermission: false
          });
        });
      });
    });
  }

  private setTabItems() {
    this.tabItems = TabsPageService.prepareTabItems();
  }

  private setAppStartUrls() {
    this.appStartUrls = [
      'splash',
      'login'
    ];
  }

  private setExceptionalUrls() {
    this.exceptionUrls = [
      'splash',
      'login',
      'tabs',
    ];
  }

}
