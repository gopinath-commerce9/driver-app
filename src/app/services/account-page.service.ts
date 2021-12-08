import { Injectable } from '@angular/core';
import { Observable, from, of, throwError } from 'rxjs';
import { filter, catchError, map, switchMap } from 'rxjs/operators';
import { Camera, CameraOptions, CameraPopoverOptions } from '@ionic-native/camera/ngx';

import { appConfigs } from './../configs/app.configs';

import { SharedService } from './shared.service';
import { RestApiService } from './rest-api.service';
import { PermissionService } from './permission.service';
import { FormValidationsService } from './form-validations.service';

@Injectable({
  providedIn: 'root'
})
export class AccountPageService {

  private currentUser: any;
  private currentUserEmail: any;
  private updatedUserData: any;

  constructor(
    private sharedService: SharedService,
    private restService: RestApiService,
    private permissionService: PermissionService,
    private formService: FormValidationsService,
    private camera: Camera
  ) { }

  public getSharedService() {
    return this.sharedService;
  }

  public getAccountDetails() {

    const postParams = {};
    const baseUrl = this.restService.getApiUrl();
    const url = (baseUrl === '') ? '' : baseUrl + 'me';
    const requestMethod = 'GET';
    const requestDataType = '';
    const bearerToken = this.restService.getDeliveryBoyToken();
    const restApiObj = this.restService.processApiRequest(url, postParams, requestMethod, requestDataType, bearerToken);

    return new Observable((observer) => {
      restApiObj.subscribe((rawResult: any) => {
        const result = (this.sharedService.checkValidJson(rawResult)) ? JSON.parse(rawResult) : rawResult;
        if (result.hasOwnProperty('success') && result.hasOwnProperty('data') && (result.success === true)) {
          observer.next(result.data);
        } else {
          let errMsg = 'No Data Found!';
          if (result.hasOwnProperty('message')) {
            const errMessage = (this.sharedService.checkValidJson(result.message)) ? JSON.parse(result.message) : result.message;
            errMsg = this.sharedService.resolveErrorParameters(errMessage);
          }
          observer.error(errMsg);
        }
      }, (err) => {
        let errMessage = (this.sharedService.checkValidJson(err)) ? JSON.parse(err) : err;
        errMessage = this.sharedService.resolveErrorParameters(errMessage);
        observer.error(errMessage);
      });
    });

  }

  public setUpdatedProfileData(profileData: any) {
    if (profileData != null) {
      this.updatedUserData = profileData;
    }
  }

  public updateUserProfile() {

    let oldPassword = '';
    if (this.updatedUserData.hasOwnProperty('oldPassword')) {
      oldPassword = (this.updatedUserData.oldPassword.trim() !== '') ? this.updatedUserData.oldPassword : '';
      delete this.updatedUserData.oldPassword;
    }
    let newPassword = '';
    if (this.updatedUserData.hasOwnProperty('newPassword')) {
      newPassword = (this.updatedUserData.newPassword.trim() !== '') ? this.updatedUserData.newPassword : '';
      delete this.updatedUserData.newPassword;
    }
    let confirmPassword = '';
    if (this.updatedUserData.hasOwnProperty('confirmPassword')) {
      confirmPassword = (this.updatedUserData.confirmPassword.trim() !== '') ? this.updatedUserData.confirmPassword : '';
      delete this.updatedUserData.confirmPassword;
    }

    const baseUrl = this.restService.getApiUrl();
    const url = (baseUrl === '') ? '' : baseUrl + 'me/update-profile';
    const bearerToken = this.restService.getDeliveryBoyToken();
    const requestMethod = 'POST';
    const requestDataType = 'form-data';
    const postParams = new FormData();
    postParams.append('userName', this.updatedUserData.userName);
    postParams.append('userContact', this.updatedUserData.userContact);

    return new Observable((observer) => {

      this.convertFileToBlob(this.updatedUserData.profilePic).subscribe((picBlob: Blob) => {
        if (this.updatedUserData.changePic) {
          postParams.append('profileAvatarRemove', this.updatedUserData.removePic);
          if (picBlob != null) {
            const filePathCleanArray: string[] = this.updatedUserData.profilePic.split('?');
            const filePathClean = filePathCleanArray[0];
            const filePathSplitter: string[] = filePathClean.split('/');
            const targetFileName: string = filePathSplitter[(filePathSplitter.length - 1)];
            postParams.append('profileAvatar', new Blob([picBlob], {type: picBlob.type}), targetFileName);
          }
        }
        this.restService.processApiRequest(url, postParams, requestMethod, requestDataType, bearerToken)
          .subscribe((rawResult: any) => {
            const result = (this.sharedService.checkValidJson(rawResult)) ? JSON.parse(rawResult) : rawResult;
            if (result.hasOwnProperty('success') && result.hasOwnProperty('data') && (result.success === true)) {
              if ((oldPassword !== '') && (newPassword !== '') && (confirmPassword !== '')) {
                this.changeUserPassword(oldPassword, newPassword, confirmPassword).subscribe((passResult) => {
                  observer.next(passResult);
                }, (passErr) => {
                  observer.error(passErr);
                });
              } else {
                observer.next(result.data);
              }
            } else {
              let errMsg = 'No Data Found!';
              if (result.hasOwnProperty('message')) {
                const errMessage = (this.sharedService.checkValidJson(result.message)) ? JSON.parse(result.message) : result.message;
                errMsg = this.sharedService.resolveErrorParameters(errMessage);
              }
              observer.error(errMsg);
            }
          }, (err) => {
            let errMessage = (this.sharedService.checkValidJson(err)) ? JSON.parse(err) : err;
            errMessage = this.sharedService.resolveErrorParameters(errMessage);
            observer.error(errMessage);
          });
      });

    });

  }

  public convertFileToBlob(filePath: string = '') {
    return new Observable((observer) => {
      if ((filePath === undefined) || (filePath == null) || (filePath.trim() === '')) {
        observer.next(null);
      } else {
        fetch(filePath).then((response: Response) => response.blob(), (reason: any) => {
          observer.next(null);
        }).then((blob: Blob) => {
          observer.next(blob);
        }, (reason: any) => {
          observer.next(null);
        });
      }
    });
  }

  public changeUserPassword(oldPassword = '', newPassword = '', confirmPassword = '') {

    if ((oldPassword === undefined) || (oldPassword == null) || (oldPassword.trim() === '')) {
      return throwError('Invalid password entry!');
    }

    if ((newPassword === undefined) || (newPassword == null) || (newPassword.trim() === '')) {
      return throwError('Invalid password entry!');
    }

    if ((confirmPassword === undefined) || (confirmPassword == null) || (confirmPassword.trim() === '')) {
      return throwError('Invalid password entry!');
    }

    const postParams = {
      userPassword: oldPassword,
      newPassword,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      newPassword_confirmation: confirmPassword
    };
    const baseUrl = this.restService.getApiUrl();
    const url = (baseUrl === '') ? '' : baseUrl + 'me/change-password';
    const requestMethod = 'POST';
    const requestDataType = 'json';
    const bearerToken = this.restService.getDeliveryBoyToken();
    const restApiObj = this.restService.processApiRequest(url, postParams, requestMethod, requestDataType, bearerToken);

    return new Observable((observer) => {
      restApiObj.subscribe((rawResult: any) => {
        const result = (this.sharedService.checkValidJson(rawResult)) ? JSON.parse(rawResult) : rawResult;
        if (result.hasOwnProperty('success') && result.hasOwnProperty('data') && (result.success === true)) {
          observer.next(result.data);
        } else {
          let errMsg = 'No Data Found!';
          if (result.hasOwnProperty('message')) {
            const errMessage = (this.sharedService.checkValidJson(result.message)) ? JSON.parse(result.message) : result.message;
            errMsg = this.sharedService.resolveErrorParameters(errMessage);
          }
          observer.error(errMsg);
        }
      }, (err) => {
        let errMessage = (this.sharedService.checkValidJson(err)) ? JSON.parse(err) : err;
        errMessage = this.sharedService.resolveErrorParameters(errMessage);
        observer.error(errMessage);
      });
    });

  }

  checkCameraPermissions() {
    return new Observable((observer) => {
      this.permissionService.checkCameraPermission().subscribe((checkData) => {
        observer.next({
          cameraPermission: true
        });
      }, (err) => {
        this.permissionService.permitCamera().subscribe((data) => {
          this.permissionService.checkCameraPermission().subscribe((checkData) => {
            observer.next({
              cameraPermission: true
            });
          }, (checkErr) => {
            observer.next({
              cameraPermission: false
            });
          });
        }, (permitErr) => {
          observer.next({
            cameraPermission: false
          });
        });
      });
    });
  }

  getCameraOptions() {
    const camOptions: CameraOptions = {
      quality: 20,
      sourceType: this.camera.PictureSourceType.CAMERA,
      /* destinationType: this.camera.DestinationType.DATA_URL, */
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum: true,
      cameraDirection: this.camera.Direction.FRONT,
      correctOrientation: true,
      /* allowEdit: true */
    };
    return camOptions;
  }

  getAlbumOptions() {
    const camOptions: CameraOptions = {
      quality: 20,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      /* destinationType: this.camera.DestinationType.DATA_URL, */
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      /* allowEdit: true */
    };
    return camOptions;
  }

  public diverSignOut(): Observable<boolean> {
    return new Observable((observer) => {
      this.restService.deviceSignOut().subscribe((result) => {
        observer.next(true);
      }, (err) => {
        observer.next(false);
      });
    });
  }

}
