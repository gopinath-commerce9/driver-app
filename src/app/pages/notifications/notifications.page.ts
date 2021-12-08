import { Component, OnInit, NgZone, ElementRef, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Platform, NavController, AlertController, LoadingController, ModalController, IonInfiniteScroll } from '@ionic/angular';
import { Router, ActivatedRoute, Route, UrlTree, NavigationEnd } from '@angular/router';
import * as moment from 'moment';
import { Subscription, Observable } from 'rxjs';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { OverlayEventDetail } from '@ionic/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';

import { appConfigs } from './../../configs/app.configs';

import { GlobalEventsService } from './../../services/global-events.service';
import { FormValidationsService } from './../../services/form-validations.service';
import { NotificationsPageService } from './../../services/notifications-page.service';

declare let google;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {

  @ViewChild('latestScroller', { static: false }) latestScroller: IonInfiniteScroll;
  @ViewChild('olderScroller', { static: false }) olderScroller: IonInfiniteScroll;
  appTitle = '';
  pageTitle = '';
  titlebarIcon = appConfigs.appMainIcon;
  notificationsList: Array<any> = [];
  defaultLoadingMessage = 'Please wait...';
  dateDisplayFormat = 'ddd, D MMM YYYY, h:mm:ss A';
  pageCount = 0;
  itemLimit = 10;

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
    private service: NotificationsPageService
  ) {
    console.log('NotificationsPage constructor');
    this.appTitle = appConfigs.appMainTitle;
    this.pageTitle = 'Notifications';
  }

  ngOnInit() {
    console.log('NotificationsPage ngOnInit');
    console.log(this.activatedRoute);

    this.displayLoader().then((loader) => {

      loader.present();

      this.activatedRoute.queryParams.subscribe((paramData) => {

        console.log('Simple Query Params : ');
        console.log(paramData);

        this.pageCount = 0;
        this.notificationsList = [];
        this.service.getNotificationList(this.pageCount, this.itemLimit).subscribe((result) => {
          if (Array.isArray(result) && (result.length > 0)) {
            result.forEach((notification: any, notifyIndex: number) => {
              this.notificationsList.push(notification);
            });
          }
          loader.dismiss();
        }, (err) => {
          let displayError = err;
          if ((err !== undefined) && err.hasOwnProperty('message')) {
            displayError = err.message;
          }
          this.service.getSharedService().displayToast(displayError);
          loader.dismiss();
        });

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
    console.log('NotificationsPage ionViewWillEnter');
  }

  ionViewDidEnter() {
    console.log('NotificationsPage ionViewDidEnter');
  }

  ionViewWillLeave() {
    console.log('NotificationsPage ionViewWillLeave');
  }

  loadLatestData(event) {
    setTimeout(() => {
      console.log('loadLatestData : ', event);
      this.pageCount = 0;
      this.updateNotificationList(0);
      event.target.complete();
    }, 1000);
  }

  loadOlderData(event) {
    setTimeout(() => {
      console.log('loadOlderData : ', event);
      this.pageCount++;
      this.updateNotificationList(1);
      event.target.complete();
    }, 1000);
  }

  updateNotificationList(direction: number = 0) {
    let directionClean = 0;
    if ((direction === 0) || (direction === 1)) {
      directionClean = direction;
    }
    this.service.getNotificationList(this.pageCount, this.itemLimit).subscribe((result) => {
      const tempArray = [];
      if (directionClean === 0) {
        this.notificationsList = [];
      }
      console.log('Updated Notification List : ', result);
      if (Array.isArray(result) && (result.length > 0)) {
        result.forEach((notification: any, notifyIndex: number) => {
          let currentOrderId = '';
          if (notification.hasOwnProperty('recordId') && (notification.recordId !== undefined) && (notification.recordId != null)) {
            currentOrderId = notification.recordId;
          }
          let currentOrderStatus = '';
          if (
            notification.hasOwnProperty('orderStatus')
            && (notification.orderStatus !== undefined)
            && (notification.orderStatus != null)
          ) {
            currentOrderStatus = notification.orderStatus.trim().toLowerCase();
          }
          if (currentOrderId !== '') {
            let checkArray = [];
            if (this.notificationsList.length > 0) {
              checkArray = this.notificationsList.filter(
                (notify) => (notify.hasOwnProperty('recordId') && (notify.recordId === currentOrderId)
              ));
            }
            if (checkArray.length === 0) {
              tempArray.push(notification);
            } else if (checkArray.length > 0) {
              const insideNotification = checkArray[0];
              if (insideNotification.orderStatus !== currentOrderStatus) {
                this.notificationsList.forEach((value, index)=>{
                  if(value.recordId === currentOrderId) {
                    this.notificationsList.splice(index, 1);
                  }
                });
                tempArray.push(notification);
              }
            }
          }
        });
      }
      if (tempArray.length > 0) {
        if (directionClean === 0) {
          this.notificationsList = [...tempArray, ...this.notificationsList];
          this.changeDetect.detectChanges();
        } else if (directionClean === 1) {
          this.notificationsList = [...this.notificationsList, ...tempArray];
          this.changeDetect.detectChanges();
        }
      }
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

  async notificationConfirm(notification: any) {
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
