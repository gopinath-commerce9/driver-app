import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Network } from '@ionic-native/network/ngx';

import { appConfigs } from './configs/app.configs';

import { SharedService } from './services/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    public network: Network,
    public sharedService: SharedService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {

      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.statusBar.overlaysWebView(false);
      this.statusBar.backgroundColorByHexString(appConfigs.appMainThemeColor);

      this.setupNetworkStatus();
      this.detectNetworkChange();

    });
  }

  setupNetworkStatus() {
    console.log(this.network);
    if (
      this.network.type == null ||
      this.network.type === this.network.Connection.NONE
    ) {
      console.log('No Active Internet Connection :-(');
      this.sharedService.setNetworkAsDisconnected();
    } else {
      console.log('We got an Active Internet Connection :-)');
      this.sharedService.setNetworkAsConnected();
    }
  }

  detectNetworkChange() {
    this.network.onDisconnect().subscribe(() => {
      console.log('network was disconnected Splash :-(');
      this.sharedService.setNetworkAsDisconnected();
      this.sharedService.displayToast('Oops! Internet connection has been lost.');
    });

    this.network.onConnect().subscribe(() => {
      console.log('The Network is connected Splash :-)');
      this.sharedService.setNetworkAsConnected();
      this.sharedService.displayToast('Back online');
    });
  }

}
