import { Component, OnInit, NgZone, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute, Route, UrlTree, NavigationEnd } from '@angular/router';
import * as moment from 'moment';
import { Subscription, Observable } from 'rxjs';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { OverlayEventDetail } from '@ionic/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { appConfigs } from './../../configs/app.configs';

import { GlobalEventsService } from './../../services/global-events.service';
import { FormValidationsService } from './../../services/form-validations.service';
import { HomePageService } from './../../services/home-page.service';

declare let google;

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  appTitle = '';
  pageTitle = '';
  titlebarIcon = appConfigs.appMainIcon;
  defaultLoadingMessage = 'Please wait...';
  recentNotifications: Array<any> = [];
  notificationsPageCount = 0;
  notificationsDisplayLimit = 3;
  recentDeliveries: Array<any> = [];
  deliveriesPageCount = 0;
  deliveriesDisplayLimit = 3;
  recentDelivered: Array<any> = [];
  deliveredPageCount = 0;
  deliveredDisplayLimit = 3;
  currentLat: number;
  currentLng: number;
  currentLocation: any;
  currentAddress: any;
  maxStarCount = 0;
  preferredAddressType = 'postal_code';
  geoCoder = new google.maps.Geocoder();
  dateDisplayFormat = 'ddd, D MMM YYYY, h:mm:ss A';

  constructor(
    private router: Router,
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private events: GlobalEventsService,
    private webView: WebView,
    private alertCtrl: AlertController,
    private loadCtrl: LoadingController,
    private modalCtrl: ModalController,
    private ngZone: NgZone,
    private geoLocation: Geolocation,
    private changeDetect: ChangeDetectorRef,
    private service: HomePageService
  ) {
    console.log('HomePage constructor');
    this.appTitle = appConfigs.appMainTitle;
    this.pageTitle = 'Home';
  }

  ngOnInit() {
    console.log('HomePage ngOnInit');
    console.log(this.activatedRoute);

    this.displayLoader().then((loader) => {

      loader.present();

      this.activatedRoute.queryParams.subscribe((paramData) => {

        console.log('Simple Query Params : ');
        console.log(paramData);

        this.recentNotifications = [];
        this.recentDeliveries = [];
        this.recentDelivered = [];
        this.setRecentNotifications();
        this.setRecentDeliveries();
        this.setRecentDelivered();

        loader.dismiss();

      }, (err) => {
        console.log('Simple Query Params Error : ');
        console.log(err);
        loader.dismiss();
      });

    }, (err) => {
      console.log('Simple Display Loader Error : ');
      console.log(err);
    });
  }

  ionViewWillEnter() {
    console.log('HomePage ionViewWillEnter');
  }

  ionViewDidEnter() {
    console.log('HomePage ionViewDidEnter');
  }

  ionViewWillLeave() {
    console.log('HomePage ionViewWillLeave');
  }

  changeLocation() {
    this.events.gotoPage({page: 'location-setter', params: {}, backward: false});
  }

  setRecentNotifications() {
    this.notificationsPageCount = 0;
    this.recentNotifications = [];
    this.service.getNotificationList(this.notificationsPageCount, this.notificationsDisplayLimit).subscribe((result) => {
      if (Array.isArray(result) && (result.length > 0)) {
        result.forEach((notification: any, notifyIndex: number) => {
          this.recentNotifications.push(notification);
        });
      }
      console.log('Recent Notify : ', this.recentNotifications);
    }, (err) => {
      let displayError = err;
      if ((err !== undefined) && err.hasOwnProperty('message')) {
        displayError = err.message;
      }
      this.service.getSharedService().displayToast(displayError);
    });
  }

  setRecentDeliveries() {
    this.deliveriesPageCount = 0;
    this.recentDeliveries = [];
    this.service.getDeliveryList(this.deliveriesPageCount, this.deliveriesDisplayLimit).subscribe((result) => {
      if (Array.isArray(result) && (result.length > 0)) {
        result.forEach((delivery: any, notifyIndex: number) => {
          this.recentDeliveries.push(delivery);
        });
      }
      console.log('Recent Delivery : ', this.recentDeliveries);
    }, (err) => {
      let displayError = err;
      if ((err !== undefined) && err.hasOwnProperty('message')) {
        displayError = err.message;
      }
      this.service.getSharedService().displayToast(displayError);
    });
  }

  setRecentDelivered() {
    this.deliveredPageCount = 0;
    this.recentDelivered = [];
    this.service.getDeliveredList(this.deliveredPageCount, this.deliveredDisplayLimit).subscribe((result) => {
      if (Array.isArray(result) && (result.length > 0)) {
        result.forEach((delivery: any, notifyIndex: number) => {
          this.recentDelivered.push(delivery);
        });
      }
      console.log('Recent Delivered : ', this.recentDelivered);
    }, (err) => {
      let displayError = err;
      if ((err !== undefined) && err.hasOwnProperty('message')) {
        displayError = err.message;
      }
      this.service.getSharedService().displayToast(displayError);
    });
  }

  getNotificationNumber(order = null) {
    let orderNumber = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('incrementId') && (order.incrementId !== null) && (order.incrementId !== '')) {
        orderNumber = '#' + order.incrementId;
      }
    }
    return orderNumber;
  }

  getNotificationDate(order = null) {
    let orderDate = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('deliveryDate') && (order.deliveryDate !== null) && (order.deliveryDate !== '')) {
        orderDate = this.displayFormattedTime(order.deliveryDate, 'ddd, D MMM YYYY');
        if (order.hasOwnProperty('deliveryTimeSlot') && (order.deliveryTimeSlot !== null) && (order.deliveryTimeSlot !== '')) {
          orderDate += ' between ' + order.deliveryTimeSlot;
        }
      }
    }
    return orderDate;
  }

  getNotificationLocation(order = null) {
    let orderLocation = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('city') && (order.city !== null) && (order.city !== '')) {
        orderLocation = order.city;
        if (order.hasOwnProperty('region') && (order.region !== null) && (order.region !== '')) {
          orderLocation += ', ' + order.region;
        }
      }
    }
    return orderLocation;
  }

  viewNotification(notification: any) {
    console.log('Get to The Order Page : ', notification);
    this.events.gotoPage({page: 'order-selector', params: {
      orderId: notification.recordId
    }, backward: false});
  }

  acceptNotification(notification: any) {
    console.log('Clicked the Notification : ', notification);
    this.notificationConfirm(notification).then((notifier) => {
      notifier.present();
    }, (notifyErr) => {
      let displayError = notifyErr;
      if ((notifyErr !== undefined) && notifyErr.hasOwnProperty('message')) {
        displayError = notifyErr.message;
      }
      this.service.getSharedService().displayToast(displayError);
    });
  }

  async notificationConfirm(notification) {
    const alerter = await this.alertCtrl.create({
      header: 'Delivery Acceptance.',
      message: 'Do you want to deliver this Order #' + notification.incrementId + '?',
      buttons: [{
        text: 'No',
        role: 'cancel',
        handler: () => { }
      }, {
        text: 'Accept',
        handler: () => {
          this.displayLoader().then((loader) => {
            loader.present();
            this.service.acceptDeliveryOrder(notification.recordId).subscribe((data) => {
              loader.dismiss();
              this.events.gotoPage({page: 'order-selector', params: {
                orderId: notification.recordId
              }, backward: false});
            }, (err) => {
              loader.dismiss();
              let displayError = err;
              if ((err !== undefined) && err.hasOwnProperty('message')) {
                displayError = err.message;
              }
              this.service.getSharedService().displayToast(displayError);
            });
          }, (loaderErr) => {
            this.service.acceptDeliveryOrder(notification.recordId).subscribe((data) => {
              this.events.gotoPage({page: 'order-selector', params: {
                orderId: notification.recordId
              }, backward: false});
            }, (err) => {
              let displayError = err;
              if ((err !== undefined) && err.hasOwnProperty('message')) {
                displayError = err.message;
              }
              this.service.getSharedService().displayToast(displayError);
            });
          });
        }
      }]
    });
    alerter.onDidDismiss().then((detail: OverlayEventDetail) => {

    });
    return alerter;
  }

  moreNotifications() {
    console.log('Clicked the more Notifications');
    this.events.gotoPage({page: 'notifications', params: {}, backward: false});
  }

  getDeliveryNumber(order = null) {
    let orderNumber = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('incrementId') && (order.incrementId !== null) && (order.incrementId !== '')) {
        orderNumber = '#' + order.incrementId;
      }
    }
    return orderNumber;
  }

  getDeliveryDate(order = null) {
    let orderDate = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('deliveryDate') && (order.deliveryDate !== null) && (order.deliveryDate !== '')) {
        orderDate = this.displayFormattedTime(order.deliveryDate, 'ddd, D MMM YYYY');
        if (order.hasOwnProperty('deliveryTimeSlot') && (order.deliveryTimeSlot !== null) && (order.deliveryTimeSlot !== '')) {
          orderDate += ' between ' + order.deliveryTimeSlot;
        }
      }
    }
    return orderDate;
  }

  getDeliveryLocation(order = null) {
    let orderLocation = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('city') && (order.city !== null) && (order.city !== '')) {
        orderLocation = order.city;
        if (order.hasOwnProperty('region') && (order.region !== null) && (order.region !== '')) {
          orderLocation += ', ' + order.region;
        }
      }
    }
    return orderLocation;
  }

  viewDelivery(delivery: any) {
    console.log('Clicked the Delivery : ', delivery);
    this.events.gotoPage({page: 'order-delivery', params: {
      orderId: delivery.recordId
    }, backward: false});
  }

  moreDeliveries() {
    console.log('Clicked the more Deliveries');
    this.events.gotoPage({page: 'deliveries', params: {}, backward: false});
  }

  getDeliveredNumber(order = null) {
    let orderNumber = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('incrementId') && (order.incrementId !== null) && (order.incrementId !== '')) {
        orderNumber = '#' + order.incrementId;
      }
    }
    return orderNumber;
  }

  getDeliveredDate(order = null) {
    let orderDate = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('deliveryDriverTime') && (order.deliveryDriverTime !== null) && (order.deliveryDriverTime !== '')) {
        orderDate = this.displayFormattedTime(order.deliveryDriverTime);
      }
    }
    return orderDate;
  }

  getDeliveredLocation(order = null) {
    let orderLocation = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('city') && (order.city !== null) && (order.city !== '')) {
        orderLocation = order.city;
        if (order.hasOwnProperty('region') && (order.region !== null) && (order.region !== '')) {
          orderLocation += ', ' + order.region;
        }
      }
    }
    return orderLocation;
  }

  viewDeliveredOrder(delivery: any) {
    console.log('Clicked the Delivered Order : ', delivery);
    this.events.gotoPage({page: 'order-details', params: {
      orderId: delivery.recordId
    }, backward: false});
  }

  moreDelivered() {
    console.log('Clicked the more Deliveries');
    this.events.gotoPage({page: 'delivered', params: {}, backward: false});
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

  displayFormattedTime(givenRawDateString: string = '', format: string = '') {
    /* let localTimeString = '';
    const monthDisplay = givenRawDate.getMonth() + 1;
    localTimeString += givenRawDate.getFullYear() + '-' + ((monthDisplay < 10) ? '0' : '') + monthDisplay + '-' + givenRawDate.getDate();
    localTimeString += ' ' + givenRawDate.getHours() + ':' + givenRawDate.getMinutes() + ':' + givenRawDate.getSeconds(); */
    if ((givenRawDateString === undefined) || (givenRawDateString === null) || (givenRawDateString.trim() === '')) {
      return '-';
    }
    if ((format === undefined) || (format === null) || (format.trim() === '')) {
      format = this.dateDisplayFormat;
    }
    const givenTimeClean = givenRawDateString.replace(/-/g, '/');
    return moment(givenTimeClean, 'YYYY-MM-DD HH:mm:ss').format(format);
  }

  async displayLoader(loadingMessage: string = '') {
    if (loadingMessage.trim() === '') {
      loadingMessage = this.defaultLoadingMessage;
    }
    const loadObj = await this.loadCtrl.create({
      /* spinner: null, */
      message: loadingMessage,
      translucent: false,
      /* cssClass: 'custom-class custom-loading' */
    });
    loadObj.onDidDismiss().then((detail: OverlayEventDetail) => {

    });
    return loadObj;
  }

}
