import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core';

import { SharedService } from './../services/shared.service';
import { PermissionService } from './../services/permission.service';

@Injectable({
  providedIn: 'root'
})
export class LocationGuard implements CanActivate {

  constructor(
    private sharedService: SharedService,
    private permissionService: PermissionService,
    private alertCtrl: AlertController
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }

  checkAppPermissions(): Observable<boolean> {
    return new Observable((observer) => {
      this.checkLocationAccess().subscribe((result) => {
        this.checkLocationPermissions().subscribe((permissionResult) => {
          if (permissionResult.hasOwnProperty('locationPermission') && (permissionResult.locationPermission === true)) {
            observer.next(true);
          } else {
            this.sharedService.displayToast('App needs permission to access location data!');
            this.checkAppPermissions().subscribe((data) => {
              observer.next(true);
            });
          }
        }, (err) => {
          this.sharedService.displayToast('App needs permission to access location data!');
          this.checkAppPermissions().subscribe((data) => {
            observer.next(true);
          });
        });
      }, (err) => {
        this.sharedService.displayToast('App needs permission to access location data!');
        this.checkAppPermissions().subscribe((data) => {
          observer.next(true);
        });
      });
    });
  }

  checkLocationAccess() {
    return new Observable(observer => {
      this.permissionService.checkLocationEnabled().subscribe((data) => {
        observer.next(true);
      }, (err) => {
        const devicePlatform = this.sharedService.getDevicePlatform();
        if (devicePlatform === 'ios') {
          observer.error(false);
        } else if (devicePlatform === 'android') {
          this.locationAlerter().then((alerter) => {
            alerter.buttons = [{
              text: 'No',
              role: 'cancel',
              handler: () => {
                observer.error(false);
              }
            }, {
              text: 'Settings',
              handler: () => {
                this.permissionService.gotoLocationSettings().subscribe((data) => {
                  observer.next(true);
                }, (settingsErr) => {
                  observer.error({
                    settings: true
                  });
                });
              }
            }];
            alerter.present();
          }, (alertErr) => {
            observer.error(false);
          });
        }
      });
    });
  }

  async locationAlerter() {
    const alerter = await this.alertCtrl.create({
      header: 'GPS Service is not enabled.',
      message: 'Do you want to enable it?',
    });
    alerter.onDidDismiss().then((detail: OverlayEventDetail) => {

    });
    return alerter;
  }

  checkLocationPermissions(): Observable<any> {
    return new Observable((observer) => {
      this.permissionService.checkLocationPermission().subscribe((checkData) => {
        observer.next({
          locationPermission: true
        });
      }, (err) => {
        this.permissionService.permitLocation().subscribe((data) => {
          this.permissionService.checkLocationPermission().subscribe((checkData) => {
            observer.next({
              locationPermission: true
            });
          }, (checkErr: any) => {
            observer.next({
              locationPermission: false
            });
          });
        }, (permitErr) => {
          observer.next({
            locationPermission: false
          });
        });
      });
    });
  }

}
