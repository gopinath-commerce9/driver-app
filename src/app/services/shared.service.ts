import { Injectable } from '@angular/core';

import { ToastController, Platform } from '@ionic/angular';
import { Device } from '@ionic-native/device/ngx';
import { AppVersion } from '@ionic-native/app-version/ngx';
import { Network } from '@ionic-native/network/ngx';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private appName: string;
  private appPackageName: string;
  private appVersionCode: string;
  private appVersionNumber: string;
  private deviceCurrentPlatform: string;
  private deviceDetails: any;
  private toastDisplaySeconds: number;
  private toastDisplayPosition: string;
  private toastCloseText: string;
  private normalToastString: string;
  private normalToastObj: any;
  private fixedToastString: string;
  private fixedToastObj: any;
  private networkConnected: boolean;
  private driverSignedIn: boolean;
  private oneSignalPlayerId: string;
  private firebaseTokenId: string;
  private currentLatitude: number = null;
  private currentLongitude: number = null;

  constructor(
    private device: Device,
    private platform: Platform,
    private appDetails: AppVersion,
    public toastCtrl: ToastController,
    private network: Network
  ) {
    this.toastDisplaySeconds = 6;
    this.toastDisplayPosition = 'bottom';
    this.normalToastString = '';
    this.fixedToastString = '';
    this.driverSignedIn = false;
    this.oneSignalPlayerId = '';
    this.firebaseTokenId = '';
  }

  setToastDelay(seconds: number = 6) {
    if (seconds != null) {
      console.log('The Toast Delay Change : ' + seconds);
      this.toastDisplaySeconds = seconds;
    }
  }

  setToastCloseText(closeText: string = 'Close') {
    if (closeText !== '') {
      this.toastCloseText = closeText;
    }
  }

  setToastPosition(position: string = 'bottom') {
    if ((position != null) && (position !== '')) {
      const positionSmalls = position.toLowerCase();
      if (
        (positionSmalls === 'top')
        || (positionSmalls === 'middle')
        || (positionSmalls === 'bottom')
      ) {
        this.toastDisplayPosition = positionSmalls;
      }
    }
  }

  setNetworkAsConnected() {
    this.networkConnected = true;
  }

  setNetworkAsDisconnected() {
    this.networkConnected = false;
  }

  setAppName() {
    this.appName = '';
    this.appDetails.getAppName().then((value) => {
      console.log('This is the AppName : ' + value);
      this.appName = value;
    }, (err) => {
      console.log('The AppName Error : ');
      console.log(err);
    }).catch((reason) => {
      console.log('The AppName Error Caught : ');
      console.log(reason);
    });
  }

  setAppPackageName() {
    this.appPackageName = '';
    this.appDetails.getPackageName().then((value) => {
      console.log('This is the AppPackageName : ' + value);
      this.appPackageName = value;
    }, (err) => {
      console.log('The AppPackageName Error : ');
      console.log(err);
    }).catch((reason) => {
      console.log('The AppPackageName Error Caught : ');
      console.log(reason);
    });
  }

  setAppVersionCode() {
    this.appVersionCode = '';
    this.appDetails.getVersionCode().then((value: string) => {
      console.log('This is the AppVersionCode : ' + value);
      this.appVersionCode = value;
    }, (err) => {
      console.log('The AppVersionCode Error : ');
      console.log(err);
    }).catch((reason) => {
      console.log('The AppVersionCode Error Caught : ');
      console.log(reason);
    });
  }

  setAppVersionNumber() {
    this.appVersionNumber = '';
    this.appDetails.getVersionNumber().then((value) => {
      console.log('This is the AppVersionNumber : ' + value);
      this.appVersionNumber = value;
    }, (err) => {
      console.log('The AppVersionNumber Error : ');
      console.log(err);
    }).catch((reason) => {
      console.log('The AppVersionNumber Error Caught : ');
      console.log(reason);
    });
  }

  setDriverSignedIn() {
    this.driverSignedIn = true;
  }

  setDriverSignedOut() {
    this.driverSignedIn = false;
  }

  setOneSignalPlayerId(playerId: string = '') {
    /* this.oneSignalPlayerId = ''; */
    if ((playerId !== undefined) && (playerId != null) && (playerId.trim() !== '')) {
      this.oneSignalPlayerId = playerId.trim();
    } else if ((playerId == null) || (playerId.trim() === '')) {
      this.oneSignalPlayerId = '';
    }
  }

  setFirebaseTokenId(tokenId: string = '') {
    /* this.firebaseTokenId = ''; */
    if ((tokenId !== undefined) && (tokenId != null) && (tokenId.trim() !== '')) {
      this.firebaseTokenId = tokenId.trim();
    } else if ((tokenId == null) || (tokenId.trim() === '')) {
      this.firebaseTokenId = null;
    }
  }

  setCurrentLatitude(lat: number = null) {
    if ((lat !== undefined) && (lat != null)) {
      this.currentLatitude = Number(lat);
    }
  }

  setCurrentLongitude(long: number = null) {
    if ((long !== undefined) && (long != null)) {
      this.currentLongitude = Number(long);
    }
  }

  getAppName(): string {
    return this.appName;
  }

  getAppPackageName(): string {
    return this.appPackageName;
  }

  getAppVersionCode(): string {
    return this.appVersionCode;
  }

  getAppVersionNumber(): string {
    return this.appVersionNumber;
  }

  getDevicePlatform() {
    if ((this.deviceCurrentPlatform == null) || (this.deviceCurrentPlatform === '')) {
      this.setDevicePlatform();
    }
    return this.deviceCurrentPlatform;
  }

  getDeviceDetails() {
    if (this.deviceDetails == null) {
      this.setDeviceDetails();
    }
    return this.deviceDetails;
  }

  getNetworkStatus(): boolean {
    return this.networkConnected;
  }

  getDriverSignedInStatus(): boolean {
    return this.driverSignedIn;
  }

  getOneSignalPlayerId(): string {
    return this.oneSignalPlayerId;
  }

  getFirebaseTokenId(): string {
    return this.firebaseTokenId;
  }

  getCurrentLatitude(): number {
    return this.currentLatitude;
  }

  getCurrentLongitude(): number {
    return this.currentLongitude;
  }

  async displayToast(toastMessage: string = '', dismissCallback: () => void = null, thisArg: any = null) {
    if ((this.toastCloseText == null) || (this.toastCloseText === '')) {
      this.setToastCloseText();
    }
    if (toastMessage !== '') {
      let toastPosition: 'bottom' | 'top' | 'middle' = 'bottom';
      if (this.toastDisplayPosition === 'bottom') {
        toastPosition = 'bottom';
      } else if (this.toastDisplayPosition === 'top') {
        toastPosition = 'top';
      } else if (this.toastDisplayPosition === 'middle') {
        toastPosition = 'middle';
      }
      console.log('The Toast Delay : ' + this.toastDisplaySeconds);
      const toast = await this.toastCtrl.create({
        message: toastMessage,
        position: toastPosition,
        color: 'dark',
        duration: this.toastDisplaySeconds * 1000
        /* cssClass: '' */
      });
      toast.onDidDismiss().then((event) => {
        console.log('Dismissed toast');
        if (dismissCallback != null) {
          if (thisArg != null) {
            dismissCallback.apply(thisArg);
          } else {
            dismissCallback();
          }
        }
      }, (err) => {
        console.log('Dismissed toast Error : ');
        console.log(err);
      }).catch((reason) => {
        console.log('Dismissed toast Error Caught : ');
        console.log(reason);
      });
      toast.present();
    }
  }

  async displayFixedToast(toastMessage: string = '', dismissCallback: () => void = null, thisArg: any = null) {
    if ((this.toastCloseText == null) || (this.toastCloseText === '')) {
      this.setToastCloseText();
    }
    if (toastMessage !== '') {
      this.fixedToastString += (this.fixedToastString !== '' ? '\n' : '') + toastMessage;
      if ((this.fixedToastObj !== undefined) && (this.fixedToastObj != null)) {
        this.fixedToastObj
          .setMessage(this.fixedToastString)
          .setDuration(this.toastDisplaySeconds * 1000)
          .onDidDismiss().then((event) => {
            console.log('Dismissed Already Fixed toast');
            this.fixedToastString = '';
            if (dismissCallback != null) {
              if (thisArg != null) {
                dismissCallback.apply(thisArg);
              } else {
                dismissCallback();
              }
            }
            this.fixedToastObj = null;
          }, (err) => {
            console.log('Dismissed Already Fixed toast Error : ');
            console.log(err);
          }).catch((reason) => {
            console.log('Dismissed Already Fixed toast Error Caught : ');
            console.log(reason);
          });
      } else {
        let toastPosition: 'bottom' | 'top' | 'middle' = 'bottom';
        if (this.toastDisplayPosition === 'bottom') {
          toastPosition = 'bottom';
        } else if (this.toastDisplayPosition === 'top') {
          toastPosition = 'top';
        } else if (this.toastDisplayPosition === 'middle') {
          toastPosition = 'middle';
        }
        this.fixedToastObj = await this.toastCtrl.create({
          message: this.fixedToastString,
          position: toastPosition,
          color: 'dark',
          cssClass: 'custom-ionic-toast-class',
          buttons: [{
            text: this.toastCloseText.toLowerCase(),
            role: 'cancel',
            handler: () => {
              this.fixedToastObj.dismiss();
            }
          }]
        });
        this.fixedToastObj.onDidDismiss().then((event) => {
          console.log('Dismissed Fixed toast');
          this.fixedToastString = '';
          if (dismissCallback != null) {
            if (thisArg != null) {
              dismissCallback.apply(thisArg);
            } else {
              dismissCallback();
            }
          }
          this.fixedToastObj = null;
        }, (err) => {
          console.log('Dismissed Fixed toast Error : ');
          console.log(err);
        }).catch((reason) => {
          console.log('Dismissed Fixed toast Error Caught : ');
          console.log(reason);
        });
        this.fixedToastObj.present();
      }
    }
  }

  checkValidJson(text: any) {
    if ((text === undefined) || (text == null) || (typeof text !== 'string') || (text.trim() === '')) {
      return false;
    }
    try {
      JSON.parse(text.trim());
      return true;
    } catch (error) {
      return false;
    }
  }

  resolveErrorParameters(error: any) {
    let returnErr = error;
    if ((error !== undefined) && (error != null) && error.hasOwnProperty('parameters')) {
      const errParams: any = error.parameters;
      const errM: string = error.message;
      let errParamObj = {};
      if (Array.isArray(errParams)) {
        errParams.forEach((element, index) => {
          errParamObj[index + 1] = element;
        });
      } else {
        errParamObj = errParams;
      }
      const objectKeyArray = Object.keys(errParamObj);
      objectKeyArray.forEach((key) => {
        returnErr = errM.replace('%' + key, '\'' + errParamObj[key] + '\'');
      });
    }
    return returnErr;
  }

  private setDevicePlatform() {
    if (this.platform.is('ios')) {
      this.deviceCurrentPlatform = 'ios';
    } else if (this.platform.is('android')) {
      this.deviceCurrentPlatform = 'android';
    } else {
      /* this.deviceCurrentPlatform = ''; */
      this.deviceCurrentPlatform = 'browser';
    }
  }

  private setDeviceDetails() {
    if (this.device != null) {
      this.deviceDetails = this.device;
    }
  }

}
