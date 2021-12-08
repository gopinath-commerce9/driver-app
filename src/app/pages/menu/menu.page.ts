import { Component, OnInit, NgZone, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute, Route, UrlTree, NavigationEnd, RouterEvent } from '@angular/router';
import * as moment from 'moment';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { OverlayEventDetail } from '@ionic/core';
import { AppVersion } from '@ionic-native/app-version/ngx';

import { appConfigs } from './../../configs/app.configs';
import { MenuItemInterface } from './../../interfaces/menu-item';

import { GlobalEventsService } from './../../services/global-events.service';
import { FormValidationsService } from './../../services/form-validations.service';
import { MenuPageService } from './../../services/menu-page.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {

  selectedPath = '';
  appVersion = '';
  pageTitle = '';
  public appPages: Array<MenuItemInterface> = [];

  constructor(
    private router: Router,
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private webView: WebView,
    private appDetails: AppVersion,
    private service: MenuPageService,
    private currentRoute: ActivatedRoute,
    private changeDetect: ChangeDetectorRef,
    private events: GlobalEventsService
  ) {

    this.appPages = this.service.getMenuItems();
    this.pageTitle = 'Menu';

    this.router.events.subscribe((event: RouterEvent) => {
      if (event && event.url) {
        this.selectedPath = event.url;
      }
    });
  }

  ngOnInit() {
    this.setAppVersionNumber();
  }

  setAppVersionNumber() {
    this.appVersion = '';
    this.platform.ready().then((isReady) => {
      this.appDetails.getVersionNumber().then((value) => {
        console.log('This is the App Value : ', value);
        this.appVersion = value;
      }, (err) => {
        console.log('The AppVersionNumber Error : ');
        console.log(err);
      }).catch((reason) => {
        console.log('The AppVersionNumber Error Caught : ');
        console.log(reason);
      });
    }).catch((reason) => {
      console.log('The Platform Ready Error Caught : ');
      console.log(reason);
    });
  }

  menuItemClicked(gotoPage: MenuItemInterface) {
    this.events.gotoMenuPage({
      page: gotoPage,
      params: {
        fromWhere: gotoPage.params
      }
    });
  }

}
