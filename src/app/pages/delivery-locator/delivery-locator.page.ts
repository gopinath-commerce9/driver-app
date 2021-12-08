import { Component, OnInit, NgZone, ElementRef, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Platform, NavController, AlertController, LoadingController, ModalController, IonInfiniteScroll } from '@ionic/angular';
import { Router, ActivatedRoute, Route, UrlTree, NavigationEnd } from '@angular/router';
import * as moment from 'moment';
import { Subscription, Observable } from 'rxjs';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { OverlayEventDetail } from '@ionic/core';
import { Geolocation, Geoposition, PositionError } from '@ionic-native/geolocation/ngx';

import { appConfigs } from './../../configs/app.configs';

import { GlobalEventsService } from './../../services/global-events.service';
import { FormValidationsService } from './../../services/form-validations.service';
import { DeliveryLocatorService } from './../../services/delivery-locator.service';

declare let google;

@Component({
  selector: 'app-delivery-locator',
  templateUrl: './delivery-locator.page.html',
  styleUrls: ['./delivery-locator.page.scss'],
})
export class DeliveryLocatorPage implements OnInit {

  @ViewChild('deliveryLocatorMap', { static: false }) deliveryLocatorMap: ElementRef;
  @ViewChild('deliveryLocatorDirectionsPanel', { static: false }) deliveryLocatorDirectionsPanel: ElementRef;
  private appTitle = '';
  private pageTitle = '';
  private titlebarIcon = appConfigs.appMainIcon;
  private currentOrderId: number;
  private currentOrderAddress: string;
  private sourcePage: string;
  private sourcePageObj: any;
  private sourcePageList: any;
  private currentOrder: any;
  private defaultLoadingMessage = 'Please wait...';
  private dateDisplayFormat = 'ddd, D MMM YYYY, h:mm:ss A';private map: any;
  private currentLat: number;
  private currentLng: number;
  private currentLocation: any;
  private locationTrackingEnabled = false;
  private locationTrackingInterval = 10;
  private trackIntervalObj: any = null;
  private enableMultiRoutes = false;
  private directionsService = new google.maps.DirectionsService();
  private directionsDisplay = new google.maps.DirectionsRenderer();

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
    private service: DeliveryLocatorService
  ) {
    console.log('DeliveryLocatorPage constructor');
    this.appTitle = appConfigs.appMainTitle;
    this.pageTitle = 'Delivery Locator';
    this.sourcePageList = {
      orderSelector: {
        page: 'order-selector',
        mode: 'pickup',
      },
      orderDelivery: {
        page: 'order-delivery',
        mode: 'delivery',
      }
    };
    this.sourcePage = 'orderDelivery';
    this.sourcePageObj = this.sourcePageList[this.sourcePage];
    const trackSettings = appConfigs.locationTracking[appConfigs.env];
    this.locationTrackingEnabled = trackSettings.enabled;
    this.locationTrackingInterval = trackSettings.trackingInterval;
  }

  ngOnInit() {
    console.log('DeliveryLocatorPage ngOnInit');
    console.log(this.activatedRoute);

    this.displayLoader().then((loader) => {

      loader.present();

      this.activatedRoute.queryParams.subscribe((paramData) => {

        console.log('Simple Query Params : ');
        console.log(paramData);

        this.sourcePage = 'orderDelivery';
        if (paramData.hasOwnProperty('fromPage')) {
          const rawSourcePage: string = paramData.fromPage;
          if (
            (rawSourcePage !== undefined)
            && (rawSourcePage != null)
            && (rawSourcePage.trim() !== '')
            && this.sourcePageList.hasOwnProperty(rawSourcePage.trim())
          ) {
            this.sourcePage = rawSourcePage.trim();
          }
        }
        this.sourcePageObj = this.sourcePageList[this.sourcePage];

        this.currentOrder = null;
        this.currentOrderAddress = '';

        if (paramData.hasOwnProperty('orderId')) {
          this.currentOrderId = paramData.orderId;
          this.service.getOrderDetails(paramData.orderId, this.sourcePageObj.mode).subscribe((result: any) => {
            console.log('The Order Details : ', result);
            this.currentOrder = result;
            if ((result !== undefined) && (result !== null)) {
              this.currentOrderAddress = this.getCustomerAddress(result);
              if (this.currentOrderAddress.trim() === '') {
                this.service.getSharedService().displayToast('Customer address is invalid!');
                loader.dismiss();
                this.events.gotoPage({page: this.sourcePageObj.page, params: {
                  orderId: result.recordId
                }, backward: true});
              } else {

                this.currentLat = this.service.getSharedService().getCurrentLatitude();
                this.currentLng = this.service.getSharedService().getCurrentLongitude();
                this.currentLocation = {
                  latitude: this.currentLat,
                  longitude: this.currentLng,
                };
                this.initMap(this.currentOrderAddress.trim());
                this.startNavigating(this.currentOrderAddress.trim());

                if (this.trackIntervalObj == null) {
                  this.trackIntervalObj = setInterval(() => {

                    this.currentLat = this.service.getSharedService().getCurrentLatitude();
                    this.currentLng = this.service.getSharedService().getCurrentLongitude();
                    this.currentLocation = {
                      latitude: this.currentLat,
                      longitude: this.currentLng,
                    };
                    this.startNavigating(this.currentOrderAddress.trim());

                  }, (this.locationTrackingInterval * 1000));
                }

              }

            } else {
              this.service.getSharedService().displayToast('Invalid Delivery Order Data!');
              loader.dismiss();
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
        } else {
          loader.dismiss();
        }

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
    console.log('DeliveryLocatorPage ionViewWillEnter');
  }

  ionViewDidEnter() {
    console.log('DeliveryLocatorPage ionViewDidEnter');

  }

  ionViewWillLeave() {
    console.log('DeliveryLocatorPage ionViewWillLeave');
   this.stopLocationInterval();
  }

  getCustomerAddress(order = null) {
    let customerAddress = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('shippingAddress') && (order.shippingAddress !== undefined) && (order.shippingAddress !== null)) {
        const customer = order.shippingAddress;
        if ((customer !== undefined) && (customer !== null)) {
          if (customer.hasOwnProperty('address1') && (customer.address1 !== null) && (customer.address1 !== '')) {
            customerAddress += customer.address1;
          }
          if (customer.hasOwnProperty('address2') && (customer.address2 !== null) && (customer.address2 !== '')) {
            customerAddress += ((customerAddress.trim() !== '') ? ', ' : '') + customer.address2;
          }
          if (customer.hasOwnProperty('address3') && (customer.address3 !== null) && (customer.address3 !== '')) {
            customerAddress += ((customerAddress.trim() !== '') ? ', ' : '') + customer.address3;
          }
          if (customer.hasOwnProperty('city') && (customer.city !== null) && (customer.city !== '')) {
            customerAddress += ((customerAddress.trim() !== '') ? ', ' : '') + customer.city;
          }
          if (customer.hasOwnProperty('region') && (customer.region !== null) && (customer.region !== '')) {
            customerAddress += ((customerAddress.trim() !== '') ? ', ' : '') + customer.region;
          }
          if (customer.hasOwnProperty('countryId') && (customer.countryId !== null) && (customer.countryId !== '')) {
            customerAddress += ((customerAddress.trim() !== '') ? ', ' : '') + customer.countryId;
          }
          if (customer.hasOwnProperty('postCode') && (customer.postCode !== null) && (customer.postCode !== '')) {
            customerAddress += ((customerAddress.trim() !== '') ? ', ' : '') + customer.postCode;
          }
        }
      }
    }
    return customerAddress;
  }

  initMap(customerAddress = '') {

    if ((this.deliveryLocatorMap != null) && (this.deliveryLocatorDirectionsPanel != null)) {

      console.log('DeliveryLocatorPage Map Initiated');

      this.map = new google.maps.Map(this.deliveryLocatorMap.nativeElement, {
        zoom: 5,
        center: { lat: this.currentLocation.latitude, lng: this.currentLocation.longitude },
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });

      this.directionsDisplay.setMap(this.map);
      this.directionsDisplay.setPanel(this.deliveryLocatorDirectionsPanel.nativeElement);
      this.directionsDisplay.set('draggable', true);
      this.directionsDisplay.addListener('directions_changed', () => {
        /* this.startNavigating(customerAddress); */
      });

    }

  }

  startNavigating(customerAddress = '') {

    const originPoint = new google.maps.LatLng(
      this.currentLocation.latitude,
      this.currentLocation.longitude
    );
    this.directionsService.route({
      origin: originPoint,
      destination: customerAddress,
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: this.enableMultiRoutes
    }, (res, status) => {
      if (status === google.maps.DirectionsStatus.OK) {

        this.directionsDisplay.setDirections(res);
        /* this.showSteps(res); */

      } else {
        console.log(status);
        let displayError = status;
        if ((status !== undefined) && status.hasOwnProperty('message')) {
          displayError = status.message;
        }
        this.service.getSharedService().displayToast(displayError);
      }
    });
  }

  showSteps(directionResult) {
    const myRoute = directionResult.routes[0].legs[0];
    for (const singleStep of myRoute.steps) {
      const marker = new google.maps.Marker({
        position: singleStep.start_point,
        map: this.map
      });
    }
  }

  computeTotalDistance(result) {
    let total = 0;
    const myRoute = result.routes[0];
    for (const singleRoute of myRoute.legs) {
      total += singleRoute.distance.value;
    }
    total = total / 1000;
    document.getElementById('total').innerHTML = total + ' km';
  }

  isOrderSelector() {
    return (this.sourcePage.trim().toLowerCase() === 'orderSelector'.trim().toLowerCase()) ? true : false;
  }

  isOrderDelivery() {
    return (this.sourcePage.trim().toLowerCase() === 'orderDelivery'.trim().toLowerCase()) ? true : false;
  }

  deliveredOrder(order: any) {
    console.log('Clicked the Order : ', order);
    this.deliveredConfirm(order).then((notifier) => {
      notifier.present();
    }, (notifyErr) => {
      let displayError = notifyErr;
      if ((notifyErr !== undefined) && notifyErr.hasOwnProperty('message')) {
        displayError = notifyErr.message;
      }
      this.service.getSharedService().displayToast(displayError);
    });
  }

  canceledOrder(order: any) {
    console.log('Clicked the Order : ', order);
    this.canceledConfirm(order).then((notifier) => {
      notifier.present();
    }, (notifyErr) => {
      let displayError = notifyErr;
      if ((notifyErr !== undefined) && notifyErr.hasOwnProperty('message')) {
        displayError = notifyErr.message;
      }
      this.service.getSharedService().displayToast(displayError);
    });
  }

  async deliveredConfirm(order: any) {
    const alerter = await this.alertCtrl.create({
      header: 'Delivery Acceptance.',
      message: 'Is the Order #' + order.incrementId + ' delivered to the customer?',
      buttons: [{
        text: 'Not Yet',
        role: 'cancel',
        handler: () => { }
      }, {
        text: 'Yes',
        handler: () => {
          this.displayLoader().then((loader) => {
            loader.present();
            this.service.setOrderAsDelivered(order.recordId).subscribe((data) => {
              loader.dismiss();
              this.events.gotoPage({page: 'deliveries', params: {}, backward: true});
            }, (err) => {
              loader.dismiss();
              let displayError = err;
              if ((err !== undefined) && err.hasOwnProperty('message')) {
                displayError = err.message;
              }
              this.service.getSharedService().displayToast(displayError);
            });
          }, (loaderErr) => {
            this.service.setOrderAsDelivered(order.recordId).subscribe((data) => {
              this.events.gotoPage({page: 'deliveries', params: {}, backward: true});
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


  async canceledConfirm(order: any) {
    const alerter = await this.alertCtrl.create({
      header: 'Cancellation Acceptance.',
      message: 'Is the Order #' + order.incrementId + ' canceled by the customer?',
      buttons: [{
        text: 'Not Yet',
        role: 'cancel',
        handler: () => { }
      }, {
        text: 'Yes',
        handler: () => {
          this.displayLoader().then((loader) => {
            loader.present();
            this.service.setOrderAsCanceled(order.recordId).subscribe((data) => {
              loader.dismiss();
              this.events.gotoPage({page: 'deliveries', params: {}, backward: true});
            }, (err) => {
              loader.dismiss();
              let displayError = err;
              if ((err !== undefined) && err.hasOwnProperty('message')) {
                displayError = err.message;
              }
              this.service.getSharedService().displayToast(displayError);
            });
          }, (loaderErr) => {
            this.service.setOrderAsCanceled(order.recordId).subscribe((data) => {
              this.events.gotoPage({page: 'deliveries', params: {}, backward: true});
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

  locatorClose(order: any = null) {
    if ((order !== undefined) && (order !== null)) {
      this.events.gotoPage({page: this.sourcePageObj.page, params: {
        orderId: order.recordId
      }, backward: true});
    }
  }

  stopLocationInterval() {
    if (this.locationTrackingEnabled) {
      if (this.trackIntervalObj != null) {
        clearInterval(this.trackIntervalObj);
        this.trackIntervalObj = null;
      }
    }
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
