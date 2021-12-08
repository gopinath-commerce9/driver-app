import { Component, OnInit, NgZone, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Platform, NavController, AlertController, LoadingController, ModalController } from '@ionic/angular';
import { Router, ActivatedRoute, Route, UrlTree, NavigationEnd } from '@angular/router';
import * as moment from 'moment';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { OverlayEventDetail } from '@ionic/core';

import { appConfigs } from './../../configs/app.configs';

import { GlobalEventsService } from './../../services/global-events.service';
import { FormValidationsService } from './../../services/form-validations.service';
import { LoginPageService } from './../../services/login-page.service';
import { TabsPageService } from './../../services/tabs-page.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  appTitle = '';
  pageTitle = '';
  loginForm: FormGroup;
  loginFormEnabled: boolean;
  defaultLoadingMessage = 'Please wait...';
  validationMessages = {
    username: [
      { type: 'isNotEmpty', message: 'Please enter an email address' },
      { type: 'pattern', message: 'Not a valid email address!' }
    ],
    password: [{ type: 'isNotEmpty', message: 'Please enter password' }]
  };

  constructor(
    private router: Router,
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private events: GlobalEventsService,
    private webView: WebView,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    private loadCtrl: LoadingController,
    private modalCtrl: ModalController,
    private ngZone: NgZone,
    private changeDetect: ChangeDetectorRef,
    private service: LoginPageService,
    private tabService: TabsPageService,
  ) {
    console.log('LoginPage constructor');
    this.appTitle = appConfigs.appMainTitle;
    this.pageTitle = 'Login';
    this.initiateLoginForm();
  }

  ngOnInit() {
    console.log('LoginPage ngOnInit');
  }

  ionViewWillEnter() {
    console.log('LoginPage ionViewWillEnter');
    console.log(this.activatedRoute);

    this.displayLoader().then((loader) => {

      loader.present();

      this.activatedRoute.queryParams.subscribe((paramData) => {
        console.log('Simple Query Params : ');
        console.log(paramData);
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

  ionViewDidEnter() {
    console.log('LoginPage ionViewDidEnter');
  }

  ionViewWillLeave() {
    console.log('LoginPage ionViewWillLeave');
  }

  initiateLoginForm() {
    this.loginForm = this.formBuilder.group({
      username: new FormControl('', Validators.compose([
        FormValidationsService.isNotEmpty,
        Validators.pattern(/(.+)@(.+){2,}\.(.+){2,}/)
      ])),
      password: new FormControl('', Validators.compose([
        FormValidationsService.isNotEmpty
      ]))
    });
  }

  checkLogin() {
    if (this.loginForm.valid) {

      const postData = this.loginForm.value;
      console.log('Login Form Data : ');
      console.log(postData);

      const username = (postData.hasOwnProperty('username') && postData.username !== '') ? postData.username : '';
      const password = (postData.hasOwnProperty('password') && postData.password !== '') ? postData.password : '';

      if ((username !== '') && (password !== '')) {

        this.displayLoader().then((loader) => {
          loader.present();
          this.service.customerLogin(username, password).subscribe((result) => {
            loader.dismiss();
            const tabItems = this.tabService.getTabItems();
            this.navCtrl.navigateRoot(['menu', 'tabs', tabItems[0].tabUrl]);
          }, (err) => {
            loader.dismiss();
            let displayError = err;
            if ((err !== undefined) && err.hasOwnProperty('message')) {
              displayError = err.message;
            }
            this.service.getSharedService().displayToast(displayError);
          });
        });

      } else {
        this.service.getSharedService().displayToast('Please provide all the required details.');
      }

    } else {
      this.service.getSharedService().displayToast('Please provide all the required details.');
    }
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
