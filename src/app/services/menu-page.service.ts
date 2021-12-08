import { Injectable } from '@angular/core';

import { Observable, of, throwError } from 'rxjs';
import { timeout, switchMap, map, mergeMap, concatMap, catchError } from 'rxjs/operators';

import { MenuItemInterface } from './../interfaces/menu-item';

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
import { DeliveredPageModule } from './../pages/delivered/delivered.module';
import { DeliveredPage } from './../pages/delivered/delivered.page';
import { AccountPageModule } from './../pages/account/account.module';
import { AccountPage } from './../pages/account/account.page';
import { LoginPageModule } from './../pages/login/login.module';
import { LoginPage } from './../pages/login/login.page';

@Injectable({
  providedIn: 'root'
})
export class MenuPageService {

  private menuItems: Array<MenuItemInterface> = [];

  constructor(
    private sharedService: SharedService,
    private restService: RestApiService,
    private permissionService: PermissionService,
    private formService: FormValidationsService
  ) {
    this.setMenuItems();
  }

  setMenuItems() {
    this.menuItems = [{
      title: 'Home', pageName: 'Home', pageComponent: HomePage, pageUrl: 'home',
      moduleClassName: 'HomePageModule', modulePath: 'home/home.module', moduleClass: HomePageModule,
      index: 0, icon: 'home'
    }, {
      title: 'Notifications', pageName: 'Notifications', pageComponent: NotificationsPage, pageUrl: 'notifications',
      moduleClassName: 'NotificationsPageModule', modulePath: 'notifications/notifications.module', moduleClass: NotificationsPageModule,
      index: 1, icon: 'notifications'
    }, {
      title: 'Out For Delivery', pageName: 'Deliveries', pageComponent: DeliveriesPage, pageUrl: 'deliveries',
      moduleClassName: 'DeliveriesPageModule', modulePath: 'deliveries/deliveries.module', moduleClass: DeliveriesPageModule,
      index: 2, icon: 'car'
    }, {
      title: 'Delivered', pageName: 'Delivered', pageComponent: DeliveredPage, pageUrl: 'delivered',
      moduleClassName: 'DeliveredPageModule', modulePath: 'delivered/delivered.module', moduleClass: DeliveredPageModule,
      index: 3, icon: 'checkmark-done'
    }, {
      title: 'My Account', pageName: 'MyAccount', pageComponent: AccountPage, pageUrl: 'account',
      moduleClassName: 'AccountPageModule', modulePath: 'account/account.module', moduleClass: AccountPageModule,
      index: 4, icon: 'person-circle'
    }, {
      title: 'Log-Out', pageName: 'LogOut', pageComponent: LoginPage, pageUrl: 'login',
      moduleClassName: 'LoginPageModule', modulePath: 'login/login.module', moduleClass: LoginPageModule,
      index: 5, icon: 'log-out'
    }];
  }

  getMenuItems(): MenuItemInterface[] {
    return this.menuItems;
  }

}
