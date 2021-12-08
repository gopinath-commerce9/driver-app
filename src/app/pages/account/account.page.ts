import { Component, OnInit, NgZone, ElementRef, ChangeDetectorRef, ViewChild } from '@angular/core';
import { Platform, NavController, AlertController, LoadingController, ModalController, ActionSheetController } from '@ionic/angular';
import { Router, ActivatedRoute, Route, UrlTree, NavigationEnd } from '@angular/router';
import * as moment from 'moment';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { WebView } from '@ionic-native/ionic-webview/ngx';
import { Camera, CameraOptions, CameraPopoverOptions } from '@ionic-native/camera/ngx';
import { OverlayEventDetail } from '@ionic/core';
import { appConfigs } from './../../configs/app.configs';

import { GlobalEventsService } from './../../services/global-events.service';
import { FormValidationsService } from './../../services/form-validations.service';
import { AccountPageService } from './../../services/account-page.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  private appTitle = '';
  private pageTitle = '';
  private titlebarIcon = appConfigs.appMainIcon;
  private currentProfile: any;
  private profileId: number;
  private todayDate: Date;
  private todayDateFragment: string;
  private profilePic = '';
  private profilePicPresent: boolean;
  private profilePicChanged: boolean;
  private accountForm: FormGroup;
  private accountFormEnabled: boolean;
  private defaultLoadingMessage = 'Please wait...';
  private validationMessages = {
    firstName: [
      { type: 'isNotEmpty', message: 'Please enter the name' }
    ],
    mobileNo: [
      { type: 'isNotEmpty', message: 'Please enter contact number' },
      { type: 'minLength', message: 'This contact number is invalid.' },
      { type: 'maxLength', message: 'This contact number is invalid.' },
      { type: 'pattern', message: 'This contact number is invalid.' },
    ],
    currentPassword: [
      { type: 'passwordSectionEmpty', message: 'Password is required' },
      { type: 'minLength', message: 'Minimum length for password is 6.' },
    ],
    newPassword: [
      { type: 'passwordSectionEmpty', message: 'Password is required' },
      { type: 'minLength', message: 'Minimum length for password is 6.' },
    ],
    confirmPassword: [
      { type: 'passwordSectionEmpty', message: 'Password is required' },
      { type: 'minLength', message: 'Minimum length for password is 6.' },
      { type: 'passwordMismatch', message: 'Passwords does not match' },
    ],
  };

  constructor(
    private router: Router,
    private platform: Platform,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private events: GlobalEventsService,
    private webView: WebView,
    private camera: Camera,
    private formBuilder: FormBuilder,
    private alertCtrl: AlertController,
    private loadCtrl: LoadingController,
    private modalCtrl: ModalController,
    private actionCtrl: ActionSheetController,
    private ngZone: NgZone,
    private service: AccountPageService
  ) {
    console.log('AccountPage constructor');
    this.appTitle = appConfigs.appMainTitle;
    this.pageTitle = 'My Account';
    this.initiateAccountForm();
  }

  ngOnInit() {
    console.log('AccountPage ngOnInit');
    console.log(this.activatedRoute);

    this.displayLoader().then((loader) => {

      loader.present();

      this.activatedRoute.queryParams.subscribe((paramData) => {

        console.log('Simple Query Params : ');
        console.log(paramData);

        this.currentProfile = null;
        this.profileId = 0;
        this.service.getAccountDetails().subscribe((result: any) => {
          this.currentProfile = result;
          if (result.hasOwnProperty('userId')) {
            this.profileId = result.userId;
          }
          this.setupAccountForm();
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

  initiateAccountForm() {

    this.accountForm = this.formBuilder.group({
      firstName: new FormControl('', Validators.compose([
        FormValidationsService.isNotEmpty
      ])),
      mobileNo: new FormControl('', Validators.compose([
        FormValidationsService.isNotEmpty,
        Validators.minLength(5),
        Validators.maxLength(15),
        Validators.pattern('^[- ()]*[0-9][- ()0-9]*$')
      ])),
      currentPassword: new FormControl(''),
      newPassword: new FormControl(''),
      confirmPassword: new FormControl(''),
    });

    this.accountForm.get('currentPassword').setValidators(
      Validators.compose([
        FormValidationsService.passwordSectionEmpty(
          this.accountForm.get('newPassword'),
          this.accountForm.get('confirmPassword')
        ),
        Validators.minLength(6)
      ])
    );

    this.accountForm.get('newPassword').setValidators(
      Validators.compose([
        FormValidationsService.passwordSectionEmpty(
          this.accountForm.get('currentPassword'),
          this.accountForm.get('confirmPassword')
        ),
        Validators.minLength(6)
      ])
    );

    this.accountForm.get('confirmPassword').setValidators(
      Validators.compose([
        FormValidationsService.passwordSectionEmpty(
          this.accountForm.get('currentPassword'),
          this.accountForm.get('newPassword')
        ),
        Validators.minLength(6),
        FormValidationsService.passwordMismatch(this.accountForm.get('newPassword'))
      ])
    );

    this.todayDate = new Date(Date.now());
    this.todayDateFragment = this.todayDate.toISOString().split('T')[0];

    this.disableProfileForm();

  }

  setupAccountForm() {

    this.profilePic = 'assets/images/profile-avatar.svg';
    this.profilePicPresent = false;
    this.profilePicChanged = false;
    if (
      this.currentProfile.hasOwnProperty('userPicture')
      && (this.currentProfile.userPicture !== undefined)
      && (this.currentProfile.userPicture != null)
      && (this.currentProfile.userPicture !== '')
    ) {
      this.profilePicPresent = true;
      this.profilePic = this.currentProfile.userPicture;
    }

    let userFirstName = '';
    if (
      this.currentProfile.hasOwnProperty('userName')
      && (this.currentProfile.userName !== undefined)
      && (this.currentProfile.userName != null)
      && (this.currentProfile.userName !== '')
    ) {
      userFirstName += this.currentProfile.userName;
    }
    this.accountForm.get('firstName').setValue(userFirstName);

    let userPhone = '';
    if (
      this.currentProfile.hasOwnProperty('userContact')
      && (this.currentProfile.userContact !== undefined)
      && (this.currentProfile.userContact != null)
      && (this.currentProfile.userContact !== '')
    ) {
      userPhone += this.currentProfile.userContact;
    }
    this.accountForm.get('mobileNo').setValue(userPhone);

    this.resetPasswordSection();

  }

  resetProfile() {
    this.setupAccountForm();
    this.disableProfileForm();
  }

  disableProfileForm() {
    console.log('The Update Profile Disabled!!');
    this.accountForm.disable();
    this.accountFormEnabled = false;
  }

  enableProfileForm() {
    console.log('The Update Profile Enabled!!');
    this.accountForm.enable();
    this.accountFormEnabled = true;
  }

  resetPasswordSection() {
    this.accountForm.get('currentPassword').setValue('');
    this.accountForm.get('newPassword').setValue('');
    this.accountForm.get('confirmPassword').setValue('');
  }

  updateProfile() {
    if (this.accountForm.valid) {

      const postData = this.accountForm.value;
      console.log('Profile Form Data : ');
      console.log(postData);

      const profileData = {
        userName: ((postData.hasOwnProperty('firstName') && (postData.firstName !== '')) ? postData.firstName : ''),
        userContact: ((postData.hasOwnProperty('mobileNo') && (postData.mobileNo !== '')) ? postData.mobileNo : ''),
        changePic: (this.profilePicChanged) ? true : false,
        removePic: (this.profilePicChanged && this.profilePicPresent) ? '0' : '1',
        profilePic: (this.profilePicChanged && this.profilePicPresent) ? this.profilePic : null,
        oldPassword: ((postData.hasOwnProperty('currentPassword') && (postData.currentPassword !== '')) ? postData.currentPassword : ''),
        newPassword: ((postData.hasOwnProperty('newPassword') && (postData.newPassword !== '')) ? postData.newPassword : ''),
        confirmPassword: ((postData.hasOwnProperty('confirmPassword') && (postData.confirmPassword !== '')) ? postData.confirmPassword : '')
      };
      this.service.setUpdatedProfileData(profileData);

      this.displayLoader().then((loader) => {

        loader.present();

        this.service.updateUserProfile().subscribe((updateResult: any) => {

          this.service.getAccountDetails().subscribe((result: any) => {

            this.currentProfile = result;
            if (result.hasOwnProperty('userId')) {
              this.profileId = result.userId;
            }
            this.todayDate = new Date(Date.now());
            this.todayDateFragment = this.todayDate.toISOString().split('T')[0];
            this.setupAccountForm();
            this.disableProfileForm();

            loader.dismiss();

          }, (err) => {
            let displayError = err;
            if ((err !== undefined) && err.hasOwnProperty('message')) {
              displayError = err.message;
            }
            this.service.getSharedService().displayToast(displayError);
            this.disableProfileForm();
            loader.dismiss();
          });

        }, (err) => {
          let displayError = err;
          if ((err !== undefined) && err.hasOwnProperty('message')) {
            displayError = err.message;
          }
          this.service.getSharedService().displayToast(displayError);
          loader.dismiss();
        });

      });

    } else {
      this.service.getSharedService().displayToast('Please provide all the required details.');
    }
  }

  processProfilePicture() {
    console.log('Clicked to change the photo!');
    this.photoActionSheet().then((aSheet) => {
      aSheet.present();
    }, (err) => {
      let displayError = err;
      if ((err !== undefined) && err.hasOwnProperty('message')) {
        displayError = err.message;
      }
      this.service.getSharedService().displayToast(displayError);
    }).catch((reason) => {
      let displayError = reason;
      if ((reason !== undefined) && reason.hasOwnProperty('message')) {
        displayError = reason.message;
      }
      this.service.getSharedService().displayToast(displayError);
    });
  }

  async photoActionSheet() {
    const photoAction = await this.actionCtrl.create({
      header: 'Albums',
      buttons: [{
        text: 'Change Photo',
        icon: 'images',
        handler: () => {
          console.log('Share clicked');
          this.checkPhotoAlbum();
        }
      }, {
        text: 'Take Photo',
        icon: 'camera',
        handler: () => {
          console.log('Take Photo clicked');
          this.takePhoto();
        }
      }, {
        text: 'Remove Photo',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.profilePic = 'assets/images/profile-avatar.svg';
          this.profilePicPresent = false;
          this.profilePicChanged = true;
          console.log('Delete clicked');
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    photoAction.onDidDismiss().then((detail: OverlayEventDetail) => {

    });
    return photoAction;
  }

  takePhoto() {
    const camOptions = this.service.getCameraOptions();
    this.processPhoto(camOptions);
  }

  checkPhotoAlbum() {
    const camOptions = this.service.getAlbumOptions();
    this.processPhoto(camOptions);
  }

  processPhoto(camOptions: CameraOptions) {

    this.camera.getPicture(camOptions).then((imagePath) => {
      this.profilePicPresent = true;
      this.profilePicChanged = true;
      this.profilePic = this.webView.convertFileSrc(imagePath);
      /* this.profilePic = 'data:image/jpeg;base64,' + imagePath; */
    }, (err) => {
      let displayError = err;
      if ((err !== undefined) && err.hasOwnProperty('message')) {
        displayError = err.message;
      }
      this.service.getSharedService().displayToast(displayError);
    }).catch((reason) => {
      let displayError = reason;
      if ((reason !== undefined) && reason.hasOwnProperty('message')) {
        displayError = reason.message;
      }
      this.service.getSharedService().displayToast(displayError);
    });

  }

  getDeliveryBoyName(profile = null) {
    let fullName = '';
    if ((profile !== undefined) && (profile !== null)) {
      if (profile.hasOwnProperty('firstName') && (profile.firstName !== null) && (profile.firstName !== '')) {
        fullName += profile.firstName;
      }
      if (profile.hasOwnProperty('lastName') && (profile.lastName !== null) && (profile.lastName !== '')) {
        fullName += ' ' + profile.lastName;
      }
      if (profile.hasOwnProperty('userName') && (profile.userName !== null) && (profile.userName !== '')) {
        fullName = profile.userName;
      }
    }
    return fullName;
  }

  getDeliveryBoyDetail(profile = null, field = '') {
    let givenDetail = '';
    if ((profile !== undefined) && (profile !== null)) {
      if ((field !== undefined) && (field !== null) && (field.trim() !== '')) {
        if (profile.hasOwnProperty(field) && (profile[field] !== null) && (profile[field] !== '')) {
          givenDetail = profile[field];
        }
      }
    }
    return givenDetail;
  }

  signOut() {
    console.log('The user signed-out!');
    this.events.publishEvent({ event: 'driver-sign-out' });
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

