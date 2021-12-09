import { Component, OnInit, NgZone, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute, Route, UrlTree, NavigationEnd } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { OverlayEventDetail } from '@ionic/core';
import { AppVersion } from '@ionic-native/app-version/ngx';

import { appConfigs } from './../../configs/app.configs';

import { GlobalEventsService } from './../../services/global-events.service';
import { SplashPageService } from './../../services/splash-page.service';
import { TabsPageService } from './../../services/tabs-page.service';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
})
export class SplashPage implements OnInit {

  appVersion = '';
  appTitle = '';
  appDelayerTime: number;
  splashImage = appConfigs.appSplashIcon;
  delayerObj: any = null;
  defaultLoadingMessage = 'Please wait...';

  constructor(
    private router: Router,
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private events: GlobalEventsService,
    private webView: WebView,
    private appDetails: AppVersion,
    private alertCtrl: AlertController,
    private loadCtrl: LoadingController,
    private modalCtrl: ModalController,
    private service: SplashPageService,
    private tabService: TabsPageService,
    private changeDetect: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    console.log('Splash constructor');
    /* this.appTitle = AppConfigs.appMainTitle; */
  }

  ngOnInit() {
    this.appDelayerTime = appConfigs.startDelay;
    this.setAppVersionNumber();
  }

  ionViewWillEnter() {
    console.log('Splash ionViewWillEnter');
    /* this.appVersion = this.sharedService.getAppVersionNumber(); */
  }

  ionViewDidEnter() {
    console.log('Splash ionViewDidEnter');
    this.appTitle = appConfigs.appMainTitle;
    this.setupApp();
  }

  ionViewWillLeave() {
    if (this.delayerObj != null) {
      clearTimeout(this.delayerObj);
    }
  }

  setupApp() {
    console.log('Setup App Called!!');
    this.delayerObj = setTimeout(() => {
      this.service.isDriverSignedIn().subscribe((result: boolean) => {
        if (result) {
          const tabItems = this.tabService.getTabItems();
          this.navCtrl.navigateRoot(['menu', 'tabs', tabItems[0].tabUrl]);
        } else {
          this.navCtrl.navigateRoot(['login']);
        }
      });
    }, this.appDelayerTime);
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
