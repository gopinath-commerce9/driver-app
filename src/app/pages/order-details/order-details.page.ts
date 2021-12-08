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
import { OrderDetailsPageService } from './../../services/order-details-page.service';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
})
export class OrderDetailsPage implements OnInit {

  private appTitle = '';
  private pageTitle = '';
  private titlebarIcon = appConfigs.appMainIcon;
  private currentOrderId: number;
  private currentOrder: any;
  private defaultLoadingMessage = 'Please wait...';
  private dateDisplayFormat = 'ddd, D MMM YYYY, h:mm:ss A';

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
    private service: OrderDetailsPageService
  ) {
    console.log('OrderDetailsPage constructor');
    this.appTitle = appConfigs.appMainTitle;
    this.pageTitle = 'Order Details';
  }

  ngOnInit() {
    console.log('OrderDetailsPage ngOnInit');
    console.log(this.activatedRoute);

    this.displayLoader().then((loader) => {

      loader.present();

      this.activatedRoute.queryParams.subscribe((paramData) => {

        console.log('Simple Query Params : ');
        console.log(paramData);

        this.currentOrder = null;

        if (paramData.hasOwnProperty('orderId')) {
          this.currentOrderId = paramData.orderId;
          this.service.getOrderDetails(paramData.orderId).subscribe((result) => {
            console.log('The Order Details : ', result);
            this.currentOrder = result;
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
    console.log('OrderDetailsPage ionViewWillEnter');
  }

  ionViewDidEnter() {
    console.log('OrderDetailsPage ionViewDidEnter');
  }

  ionViewWillLeave() {
    console.log('OrderDetailsPage ionViewWillLeave');
  }

  orderItemsValidator(order = null) {
    return (
      (order !== undefined)
      && (order !== null)
      && order.hasOwnProperty('orderItems')
      && (order.orderItems !== null)
      && Array.isArray(order.orderItems)
      && (order.orderItems.length > 0)
    );
  }

  getOrderNumber(order = null) {
    let orderNumber = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('incrementId') && (order.incrementId !== null) && (order.incrementId !== '')) {
        orderNumber = '#' + order.incrementId;
      }
    }
    return orderNumber;
  }

  getOrderStatus(order = null) {
    let orderStatus = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('orderStatus') && (order.orderStatus !== null) && (order.orderStatus !== '')) {
        let orderStatusRaw = order.orderStatus;
        orderStatusRaw = orderStatusRaw.replace(/-/g, ' ');
        orderStatus = orderStatusRaw.replace(/_/g, ' ');
      }
    }
    return orderStatus;
  }

  getItemName(orderItem = null) {
    let orderItemName = '';
    if ((orderItem !== undefined) && (orderItem !== null)) {
      if (orderItem.hasOwnProperty('itemName') && (orderItem.itemName !== null) && (orderItem.itemName !== '')) {
        orderItemName = orderItem.itemName;
      }
    }
    return orderItemName;
  }

  getItemQty(orderItem = null) {
    let orderItemQty = '0';
    if ((orderItem !== undefined) && (orderItem !== null)) {
      if (orderItem.hasOwnProperty('qtyOrdered') && (orderItem.qtyOrdered !== null) && (orderItem.qtyOrdered !== '')) {
        orderItemQty = orderItem.qtyOrdered;
        if (orderItem.hasOwnProperty('sellingUnit') && (orderItem.sellingUnit !== null) && (orderItem.sellingUnit !== '')) {
          orderItemQty += ' ' + orderItem.sellingUnit;
        }
      }
    }
    return orderItemQty;
  }

  getNotificationDate(order = null) {
    let orderDate = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('deliveryDate') && (order.deliveryDate !== null) && (order.deliveryDate !== '')) {
        orderDate = this.displayFormattedTime(order.deliveryDate, 'ddd, D MMM YYYY');
      }
    }
    return orderDate;
  }

  getNotificationTimeSlot(order = null) {
    let orderTimeSlot = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('deliveryTimeSlot') && (order.deliveryTimeSlot !== null) && (order.deliveryTimeSlot !== '')) {
        orderTimeSlot = order.deliveryTimeSlot;
      }
    }
    return orderTimeSlot;
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

  getOrderCreatedDate(order: any = null) {
    let orderDate = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('orderCreatedAt') && (order.orderCreatedAt !== null) && (order.orderCreatedAt !== '')) {
        orderDate = this.displayFormattedTime(order.orderCreatedAt);
      }
    }
    return orderDate;
  }

  getOrderPreparedDate(order: any = null) {
    let orderDate = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('deliveryPickerTime') && (order.deliveryPickerTime !== null) && (order.deliveryPickerTime !== '')) {
        orderDate = this.displayFormattedTime(order.deliveryPickerTime);
      }
    }
    return orderDate;
  }

  getOrderDeliveredDateLabel(order: any = null) {
    let orderDateLabel = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('orderDeliveredTime') && (order.orderDeliveredTime !== null) && (order.orderDeliveredTime !== '')) {
        orderDateLabel = 'Delivered At';
      } else if (order.hasOwnProperty('orderCanceledTime') && (order.orderCanceledTime !== null) && (order.orderCanceledTime !== '')) {
        orderDateLabel = 'Canceled At';
      }
    }
    return orderDateLabel;
  }

  getOrderDeliveredDate(order: any = null) {
    let orderDate = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('deliveryDriverTime') && (order.deliveryDriverTime !== null) && (order.deliveryDriverTime !== '')) {
        orderDate = this.displayFormattedTime(order.deliveryDriverTime);
      } else if (order.hasOwnProperty('orderCanceledTime') && (order.orderCanceledTime !== null) && (order.orderCanceledTime !== '')) {
        orderDate = this.displayFormattedTime(order.orderCanceledTime);
      }
    }
    return orderDate;
  }

  getCustomerName(order = null) {
    let customerFullName = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('shippingAddress') && (order.shippingAddress !== undefined) && (order.shippingAddress !== null)) {
        const customer = order.shippingAddress;
        if ((customer !== undefined) && (customer !== null)) {
          if (customer.hasOwnProperty('firstName') && (customer.firstName !== null) && (customer.firstName !== '')) {
            customerFullName += customer.firstName;
          }
          if (customer.hasOwnProperty('lastName') && (customer.lastName !== null) && (customer.lastName !== '')) {
            customerFullName += ' ' + customer.lastName;
          }
          if (customer.hasOwnProperty('name') && (customer.name !== null) && (customer.name !== '')) {
            customerFullName = customer.name;
          }
        }
      }
    }
    return customerFullName;
  }

  getCustomerContact(order = null) {
    let contactNumber = '';
    if ((order !== undefined) && (order !== null)) {
      if (order.hasOwnProperty('shippingAddress') && (order.shippingAddress !== undefined) && (order.shippingAddress !== null)) {
        const customer = order.shippingAddress;
        if ((customer !== undefined) && (customer !== null)) {
          if (customer.hasOwnProperty('contactNumber') && (customer.contactNumber !== null) && (customer.contactNumber !== '')) {
            contactNumber = customer.contactNumber;
          }
        }
      }
    }
    return contactNumber;
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

  closeOrderDetails(order = null) {
    this.events.gotoPage({page: 'delivered', params: {}, backward: true});
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
