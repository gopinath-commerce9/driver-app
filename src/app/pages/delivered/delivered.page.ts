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
import { DeliveredPageService } from './../../services/delivered-page.service';

declare let google;

@Component({
  selector: 'app-delivered',
  templateUrl: './delivered.page.html',
  styleUrls: ['./delivered.page.scss'],
})
export class DeliveredPage implements OnInit {

  @ViewChild('latestScroller', { static: false }) latestScroller: IonInfiniteScroll;
  @ViewChild('olderScroller', { static: false }) olderScroller: IonInfiniteScroll;
  appTitle = '';
  pageTitle = '';
  titlebarIcon = appConfigs.appMainIcon;
  deliveredList: Array<any> = [];
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
    private service: DeliveredPageService
  ) {
    console.log('DeliveredPage constructor');
    this.appTitle = appConfigs.appMainTitle;
    this.pageTitle = 'Delivered Orders';
  }

  ngOnInit() {
    console.log('DeliveredPage ngOnInit');
    console.log(this.activatedRoute);

    this.displayLoader().then((loader) => {

      loader.present();

      this.activatedRoute.queryParams.subscribe((paramData) => {

        console.log('Simple Query Params : ');
        console.log(paramData);

        this.pageCount = 0;
        this.deliveredList = [];
        this.service.getDeliveredList(this.pageCount, this.itemLimit).subscribe((result) => {
          if (Array.isArray(result) && (result.length > 0)) {
            result.forEach((delivery: any, notifyIndex: number) => {
              this.deliveredList.push(delivery);
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
    console.log('DeliveredPage ionViewWillEnter');
  }

  ionViewDidEnter() {
    console.log('DeliveredPage ionViewDidEnter');
  }

  ionViewWillLeave() {
    console.log('DeliveredPage ionViewWillLeave');
  }

  loadLatestData(event) {
    setTimeout(() => {
      console.log('loadLatestData : ', event);
      this.pageCount = 0;
      this.updateDeliveredList(0);
      event.target.complete();
    }, 1000);
  }

  loadOlderData(event) {
    setTimeout(() => {
      console.log('loadOlderData : ', event);
      this.pageCount++;
      this.updateDeliveredList(1);
      event.target.complete();
    }, 1000);
  }

  updateDeliveredList(direction: number = 0) {
    let directionClean = 0;
    if ((direction === 0) || (direction === 1)) {
      directionClean = direction;
    }
    this.service.getDeliveredList(this.pageCount, this.itemLimit).subscribe((result) => {
      const tempArray = [];
      if (directionClean === 0) {
        this.deliveredList = [];
      }
      console.log('Updated Delivery List : ', result);
      if (Array.isArray(result) && (result.length > 0)) {
        result.forEach((delivery: any, notifyIndex: number) => {
          let currentOrderId = '';
          if (delivery.hasOwnProperty('recordId') && (delivery.recordId !== undefined) && (delivery.recordId != null)) {
            currentOrderId = delivery.recordId;
          }
          let currentOrderStatus = '';
          if (
            delivery.hasOwnProperty('orderStatus')
            && (delivery.orderStatus !== undefined)
            && (delivery.orderStatus != null)
          ) {
            currentOrderStatus = delivery.orderStatus.trim().toLowerCase();
          }
          if (currentOrderId !== '') {
            let checkArray = [];
            if (this.deliveredList.length > 0) {
              checkArray = this.deliveredList.filter(
                (notify) => (notify.hasOwnProperty('recordId') && (notify.recordId === currentOrderId)
              ));
            }
            if (checkArray.length === 0) {
              tempArray.push(delivery);
            } else if (checkArray.length > 0) {
              const insideDelivery = checkArray[0];
              if (insideDelivery.orderStatus !== currentOrderStatus) {
                this.deliveredList.forEach((value, index)=>{
                  if(value.recordId === insideDelivery.recordId) {
                    this.deliveredList.splice(index, 1);
                  }
                });
                tempArray.push(delivery);
              }
            }
          }
        });
      }
      if (tempArray.length > 0) {
        if (directionClean === 0) {
          this.deliveredList = [...tempArray, ...this.deliveredList];
          this.changeDetect.detectChanges();
        } else if (directionClean === 1) {
          this.deliveredList = [...this.deliveredList, ...tempArray];
          this.changeDetect.detectChanges();
        }
      }
    });
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
