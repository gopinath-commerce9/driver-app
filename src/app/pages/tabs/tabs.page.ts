import { Component, OnInit, ViewChild, OnDestroy, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, Route, UrlTree, NavigationEnd } from '@angular/router';
import { NavController, IonTabs, LoadingController, AlertController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { OneSignal } from '@ionic-native/onesignal/ngx';
import { FirebaseX } from '@ionic-native/firebase-x/ngx';
import { Geolocation, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';

import { appConfigs } from './../../configs/app.configs';
import { PageInterface } from './../../interfaces/page';
import { MenuItemInterface } from './../../interfaces/menu-item';
import { TabItemInterface } from './../../interfaces/tab-item';

import { GlobalEventsService } from './../../services/global-events.service';
import { TabsPageService } from './../../services/tabs-page.service';

declare let google;

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnInit, OnDestroy {

  @ViewChild('tabContent', { static: false }) tabRef: IonTabs;
  tabs: IonTabs;
  public appTabs: Array<TabItemInterface> = [];
  menuEventer: Subscription = null;
  pageEventer: Subscription = null;
  normalEventer: Subscription = null;
  oneSignalEnabled = false;
  oneSignalId: string;
  oneSignalGoogleNumber: string;
  firebaseEnabled = false;
  firebaseTokenId: string;
  currentLat: number;
  currentLng: number;
  currentLocation: any;
  locationTrackingEnabled = false;
  locationTrackingInterval = 10;
  trackIntervalObj: any = null;
  driveWatch: Observable<unknown> = null;
  driveWatchSub: Subscription = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private service: TabsPageService,
    private events: GlobalEventsService,
    private changeDetect: ChangeDetectorRef,
    private oneSignal: OneSignal,
    private firebase: FirebaseX,
    private geoLocation: Geolocation
  ) {
    console.log('TabsPage constructor');
    this.appTabs = this.service.getTabItems();
    this.menuEventer = this.events.getMenuPagePublisher().subscribe((data: any) => {
      console.log('Menu Page Event : ', data);
      const gotoPage: MenuItemInterface = (data.hasOwnProperty('page')) ? data.page : null;
      const pageParams: any = (data.hasOwnProperty('params')) ? data.params : {};
      this.pushViewToTabItem(gotoPage, pageParams);
    });
    this.pageEventer = this.events.getPagePublisher().subscribe((data: any) => {
      console.log('Normal Page Event : ', data);
      const gotoPageUrl: string = (data.hasOwnProperty('page')) ? data.page : '';
      const pageParams: any = (data.hasOwnProperty('params')) ? data.params : {};
      const backward: boolean = (data.hasOwnProperty('backward')) ? data.backward : false;
      this.resolvePageComponentAndPush(gotoPageUrl, pageParams, backward);
    });
    this.normalEventer = this.events.getEventPublisher().subscribe((data: any) => {
      console.log('Normal Event : ', data);
      const eventName: string = (data.hasOwnProperty('event')) ? data.event : '';
      if (eventName === 'refresh-cart-count') {
        this.checkChanges();
      }
      if (eventName === 'driver-sign-out') {
        this.driverSignOutProcess();
      }
    });
    this.initiateOneSignalService();
    this.initiateFirebaseService();
    this.initUserTracking();
  }

  ngOnInit(): void {
    console.log('TabsPage ngOnInit');
  }

  ngOnDestroy(): void {
    console.log('TabsPage ngOnDestroy');
    this.menuEventer.unsubscribe();
    this.pageEventer.unsubscribe();
    this.normalEventer.unsubscribe();
  }

  pushViewToTabItem(targetPage: MenuItemInterface, pageParams: any = {}) {
    console.log('The Page Interface :');
    console.log(targetPage);
    if (targetPage.pageUrl === 'login') {
      this.driverSignOutProcess();
    } else {
      this.resolvePageComponentAndPush(targetPage.pageUrl, pageParams);
    }
  }

  resolvePageComponentAndPush(targetPageUrl: string, pageParams: any = {}, backward: boolean = false) {

    let targetTabInterface: TabItemInterface = null;
    if (this.appTabs.length > 0) {
      this.appTabs.forEach((currentTab: TabItemInterface, tabIndex: number) => {
        if (currentTab.tabUrl === targetPageUrl) {
          targetTabInterface = currentTab;
        }
      });
    }

    if (targetTabInterface != null) {
      this.navCtrl.navigateRoot(['menu', 'tabs', targetPageUrl], { queryParams: pageParams });
    } else {

      const appStarters: Array<string> = this.service.getAppStartUrls();
      let isAppStarter = false;
      const currentConfig: Route[] = this.router.config;
      let targetRoute: Route = null;
      if (currentConfig.length > 0) {
        currentConfig.forEach((mainRoute: Route, mainIndex: number) => {
          if (mainRoute.path === targetPageUrl) {
            targetRoute = mainRoute;
            if ((appStarters.length > 0) && (appStarters.indexOf(targetPageUrl) >= 0)) {
              isAppStarter = true;
            }
          }
        });
      }
      if (targetRoute != null) {
        if (isAppStarter) {
          this.navCtrl.navigateRoot([targetPageUrl], { queryParams: pageParams });
        } else {
          const activatedRouterConfig: Route = this.activatedRoute.routeConfig;
          if (activatedRouterConfig.children.length > 0) {
            activatedRouterConfig.children.forEach((childRoute: Route, childIndex: number) => {
              if (childRoute.path === this.tabRef.getSelected()) {
                if (childRoute.children.length > 0) {
                  let foundChildRoute = false;
                  childRoute.children.forEach((subChildren: Route, subIndex: number) => {
                    if (subChildren.path === targetPageUrl) {
                      foundChildRoute = true;
                    }
                  });
                  if (!foundChildRoute) {
                    childRoute.children.push({ path: targetPageUrl, loadChildren: targetRoute.loadChildren });
                  }
                }
              }
            });
          }
          if ((backward !== undefined) && (backward !== null) && (backward === true)) {
            this.navCtrl.navigateBack(['menu', 'tabs', this.tabRef.getSelected(), targetPageUrl], { queryParams: pageParams });
          } else {
            this.navCtrl.navigateForward(['menu', 'tabs', this.tabRef.getSelected(), targetPageUrl], { queryParams: pageParams });
          }
        }
      } else {
        console.log('Could not find Route : ' + targetPageUrl);
        /* throw Error('Could not find Route : ' + targetPageUrl); */
      }

    }
  }

  initiateOneSignalService() {

    const pushSettings = appConfigs.oneSignal[appConfigs.env];
    this.oneSignalEnabled = pushSettings.enabled;
    this.oneSignalId = pushSettings.appId;
    const devicePlatform = this.service.getSharedService().getDevicePlatform();
    this.oneSignalGoogleNumber = (devicePlatform === 'android') ? pushSettings.googleProjectNumber : null;

    if (this.oneSignalEnabled) {

      this.oneSignal.startInit(this.oneSignalId, this.oneSignalGoogleNumber);

      this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

      this.oneSignal.handleNotificationReceived().subscribe((jsonData) => {
        console.log('Notification Received from OneSignal : ');
        console.log(jsonData);
      }, (err) => {
        console.log('Notification Received Error from OneSignal : ');
        console.log(err);
      });

      this.oneSignal.handleNotificationOpened().subscribe((jsonData) => {
        console.log('Notification opened from OneSignal : ');
        console.log(jsonData);
        const bannerImageTag = 'id';
        let pushImageUrl = '';
        if (jsonData.hasOwnProperty('notification') && jsonData.notification.hasOwnProperty('payload')) {
          if ((devicePlatform === 'android') && jsonData.notification.payload.hasOwnProperty('bigPicture')) {
            if ((jsonData.notification.payload.bigPicture != null) && (jsonData.notification.payload.bigPicture !== '')) {
              pushImageUrl = jsonData.notification.payload.bigPicture;
            }
          } else if ((devicePlatform === 'ios') && jsonData.notification.payload.hasOwnProperty('rawPayload')) {
            const rawPayLoad: string = JSON.stringify(jsonData.notification.payload.rawPayload);
            const rawPayLoadParsed = JSON.parse(rawPayLoad);
            if (rawPayLoadParsed.hasOwnProperty('att') && (rawPayLoadParsed.att != null)) {
              if (rawPayLoadParsed.att.hasOwnProperty(bannerImageTag)) {
                if ((rawPayLoadParsed.att[bannerImageTag] != null) && (rawPayLoadParsed.att[bannerImageTag] !== '')) {
                  pushImageUrl = rawPayLoadParsed.att[bannerImageTag];
                }
              }
            }
          }
        }

        let notificationPanel = null;
        if (pushImageUrl !== '') {
          const imageMessageContent = '<div class="notification-pane-banner-img"><img src="' + pushImageUrl + '"></div>';
          this.displayLoader(imageMessageContent).then((loader) => {
            notificationPanel = loader;
          });
          if (notificationPanel != null) {
            notificationPanel.present();
          }
        }

        const dismissed = () => {
          if (notificationPanel != null) {
            notificationPanel.present().then((value: any) => {
              notificationPanel.dismiss();
            });
          }
        };

      }, (err) => {
        console.log('Notification Opened Error from OneSignal : ');
        console.log(err);
      });

      this.oneSignal.endInit();

      this.oneSignal.getIds().then((ids) => {
        this.oneSignal.setSubscription(true);
        console.log('The OneSignal Player Ids : ');
        console.log(ids);
        if (ids.hasOwnProperty('userId')) {
          this.service.getSharedService().setOneSignalPlayerId(ids.userId);
          this.service.sendOneSignalPlayerId(ids.userId).subscribe((result: any) => {
            console.log('OneSignal Player Id Sent : ', result);
          }, (err: any) => {
            console.log('OneSignal Player Id Sent Error : ', err);
          });
        }
      }, (err) => {
        console.log('The OneSignal Player Ids Error : ');
        console.log(err);
      }).catch((reason) => {
        console.log('The OneSignal Player Ids Error Caught : ');
        console.log(reason);
      });

    }

  }

  initiateFirebaseService() {

    const pushSettings = appConfigs.firebase[appConfigs.env];
    this.firebaseEnabled = pushSettings.enabled;

    if (this.firebaseEnabled) {

      this.firebase.getToken().then((token: string) => {
        this.service.getSharedService().setFirebaseTokenId(token);
        this.service.sendFirebaseTokenId(token).subscribe((result: any) => {
          console.log('Firebase Token Id Sent : ', result);
        }, (err: any) => {
          console.log('Firebase Token Id Sent Error : ', err);
        });
      }, (err: any) => {
        console.log('The Firebase Token Id Error : ');
        console.log(err);
      }).catch((reason: any) => {
        console.log('The Firebase Token Id Error Caught : ');
        console.log(reason);
      });

      this.firebase.onMessageReceived().subscribe((notificationData: any) => {
        console.log('Here is the Notification Data : ', notificationData);
      }, (err: any) => {
        console.log('Here is the Notification Error : ', err);
      });

    }

  }

  initUserTracking() {

    const trackSettings = appConfigs.locationTracking[appConfigs.env];
    this.locationTrackingEnabled = trackSettings.enabled;
    this.locationTrackingInterval = trackSettings.trackingInterval;

    if (this.locationTrackingEnabled) {

      this.resolveLocationPermissions().subscribe((resolverResult: any) => {

        this.geoLocation.getCurrentPosition({
          maximumAge: 60000,
          timeout: 30000,
          enableHighAccuracy: true
        }).then((resp) => {

          this.currentLocation = resp.coords;
          this.currentLat = resp.coords.latitude;
          this.currentLng = resp.coords.longitude;

          this.service.getSharedService().setCurrentLatitude(this.currentLat);
          this.service.getSharedService().setCurrentLongitude(this.currentLng);

          this.service.sendUserLocation(this.currentLat, this.currentLng).subscribe((sendResult: any) => {
            console.log('Send Initial Location Result : ', sendResult);
            this.startLocationTracking();
          }, (sendErr: any) => {
            console.log('Send Initial Location Result Erroe : ', sendErr);
            this.startLocationTracking();
          });

        }).catch((error) => {
          console.log('Error getting location', error);
        });

      }, (resolverErr: any) => {
        this.service.getSharedService().displayToast(resolverErr);
      });

    }

  }

  startLocationTracking() {

    const trackSettings = appConfigs.locationTracking[appConfigs.env];
    this.locationTrackingEnabled = trackSettings.enabled;
    this.locationTrackingInterval = trackSettings.trackingInterval;

    if (this.locationTrackingEnabled) {

      this.resolveLocationPermissions().subscribe((resolverResult: any) => {

        if (this.trackIntervalObj == null) {

          this.driveWatch = new Observable((observer) => {
            this.geoLocation.getCurrentPosition({
              enableHighAccuracy: true
            }).then((resp: Geoposition) => {
              observer.next(resp);
             }).catch((error: any) => {
               observer.error(error);
             });
          });

          this.trackIntervalObj = setInterval(() => {
            this.driveWatchSub = this.driveWatch.subscribe((watchResp: any) => {
              const updateLocation = new google.maps.LatLng(
                watchResp.coords.latitude,
                watchResp.coords.longitude
              );
              this.currentLocation = watchResp.coords;
              this.currentLat = watchResp.coords.latitude;
              this.currentLng = watchResp.coords.longitude;

              this.service.getSharedService().setCurrentLatitude(this.currentLat);
              this.service.getSharedService().setCurrentLongitude(this.currentLng);

              this.service.sendUserLocation(this.currentLat, this.currentLng).subscribe((sendResult: any) => {
                console.log('Send Location Result : ', sendResult);
              }, (sendErr: any) => {
                console.log('Send Location Result Error : ', sendErr);
              });
            }, (watchErr: any) => {
              console.log('Watch Location Error : ', watchErr);
            });

          }, (this.locationTrackingInterval * 1000));
        }

      }, (resolverErr: any) => {
        this.service.getSharedService().displayToast(resolverErr);
      });

    }

  }

  stopLocationTracking() {
    if (this.trackIntervalObj != null) {
      if (this.driveWatch != null) {
        if (this.driveWatchSub != null) {
          this.driveWatchSub.unsubscribe();
          this.driveWatchSub = null;
        }
        this.driveWatch = null;
      }
      clearInterval(this.trackIntervalObj);
      this.trackIntervalObj = null;
    }
  }

  driverSignOutProcess() {
    this.service.diverSignOut().subscribe((result: boolean) => {
      if (result) {
        if (this.oneSignalEnabled) {
          this.oneSignal.getIds().then((ids) => {
            if (ids.hasOwnProperty('userId')) {
              this.service.getSharedService().setOneSignalPlayerId(ids.userId);
            }
            this.oneSignal.setSubscription(false);
          }, (err) => {
            console.log('The OneSignal Player Ids Error : ');
            console.log(err);
          }).catch((reason) => {
            console.log('The OneSignal Player Ids Error Caught : ');
            console.log(reason);
          });
        }
        if (this.firebaseEnabled) {
          this.firebase.setAutoInitEnabled(false).then((autoInitResult: any) => {
            console.log('Firebase Auto init has been disabled : ', autoInitResult);
            this.firebase.unregister().then((unregisterResult: any) => {
              console.log('Firebase Unregister successfull : ', unregisterResult);
              this.service.getSharedService().setFirebaseTokenId(null);
            }, (registerErr: any) => {
              console.log('Firebase Unregister Error : ', registerErr);
              this.service.getSharedService().setFirebaseTokenId(null);
            });
          }, (autoInitErr: any) => {
            console.log('Firebase Auto init Error : ', autoInitErr);
            this.firebase.unregister().then((unregisterResult: any) => {
              console.log('Firebase Unregister successfull : ', unregisterResult);
              this.service.getSharedService().setFirebaseTokenId(null);
            }, (registerErr: any) => {
              console.log('Firebase Unregister Error : ', registerErr);
              this.service.getSharedService().setFirebaseTokenId(null);
            });
          });
        }
        if (this.locationTrackingEnabled) {
          this.stopLocationTracking();
        }
        this.service.getSharedService().displayToast('The user signed-out successfully.');
        this.navCtrl.navigateRoot(['login'], { queryParams: {} });
      } else {
        this.service.getSharedService().displayToast('The user could not sign-out.');
      }
    });
  }

  resolveLocationPermissions() {
    return new Observable((observer) => {

      this.checkLocationAccess().subscribe((result) => {
        this.service.checkLocationPermissions().subscribe((permissionResult: any) => {
          console.log('LocPermResult : ', permissionResult);
          if (permissionResult.hasOwnProperty('locationPermission') && (permissionResult.locationPermission === true)) {
            observer.next(result);
          } else {
            observer.error('Location Access not permitted');
          }
        }, (permissionErr: any) => {
          observer.error(permissionErr);
        });
      }, (accessErr: any) => {
        observer.error(accessErr);
      });

    });
  }

  checkLocationAccess() {
    return new Observable(observer => {
      this.service.checkLocationEnabled().subscribe((data) => {
        observer.next(true);
      }, (err) => {
        const devicePlatform = this.service.getSharedService().getDevicePlatform();
        if (devicePlatform === 'ios') {
          observer.error(false);
        } else if (devicePlatform === 'android') {
          this.locationAlerter().then((alerter) => {
            alerter.buttons = [{
              text: 'No',
              role: 'cancel',
              handler: () => {
                observer.error(false);
                // eslint-disable-next-line @typescript-eslint/dot-notation
                navigator['app'].exitApp();
              }
            }, {
              text: 'Settings',
              handler: () => {
                this.service.gotoLocationSettings().subscribe((data) => {
                  observer.next(true);
                }, (settingsErr) => {
                  observer.error({
                    settings: true,
                  });
                });
              }
            }];
            alerter.present();
          }, (alertErr) => {
            observer.error(false);
          });
        }
      });
    });
  }

  async locationAlerter() {
    const alerter = await this.alertCtrl.create({
      header: 'Location Access.',
      message: 'Location Access is not enabled. Do you want to enable it?',
      cssClass: 'app-custom-general-alert-area',
    });
    alerter.onDidDismiss().then((detail: OverlayEventDetail) => {

    });
    return alerter;
  }

  tabItemClicked(tab: TabItemInterface) {
    console.log('Tab Item Clicked : ', tab);
    this.navCtrl.navigateRoot(['menu', 'tabs', tab.tabUrl], { queryParams: {} });
  }

  checkChanges() {
    this.changeDetect.detectChanges();
  }

  async displayLoader(loadingMessage: string = '') {
    if (loadingMessage.trim() === '') {
      loadingMessage = '';
    }
    const loadObj = await this.loadingCtrl.create({
      /* spinner: null, */
      message: loadingMessage,
      translucent: false,
      backdropDismiss: true
      /* cssClass: 'custom-class custom-loading' */
    });
    loadObj.onDidDismiss().then((detail: OverlayEventDetail) => {

    });
    return loadObj;
  }

}
