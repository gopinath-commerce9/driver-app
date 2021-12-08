import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Observable } from 'rxjs';

import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private locationAccessAvailable = false;

  constructor(
    private diagnostic: Diagnostic,
    private sharedService: SharedService,
    private androidPermissions: AndroidPermissions
  ) {
    this.locationChangeHandler();
  }

  public getLocationAccessState(): boolean {
    return this.locationAccessAvailable;
  }

  public gotoLocationSettings() {
    return new Observable(observer => {
      const devicePlatform = this.sharedService.getDevicePlatform();
      if (devicePlatform === 'ios') {
        observer.error(this.diagnostic.locationMode.LOCATION_OFF);
      } else if (devicePlatform === 'android') {
        this.diagnostic.switchToLocationSettings();
        this.checkLocationEnabled().subscribe(
          data => {
            observer.next(data);
          },
          err => {
            observer.error(err);
          }
        );
      }
    });
  }

  public checkLocationPermission() {
    return new Observable(observer => {
      this.diagnostic.isLocationAuthorized().then((data) => {
        if (data === true) {
          this.setLocationAccessState(true);
          observer.next(data);
        } else {
          this.setLocationAccessState(false);
          observer.error(data);
        }
      }).catch((err) => {
        observer.error(err);
      });
    });
  }

  public checkLocationEnabled() {
    return new Observable(observer => {
      this.diagnostic.isLocationEnabled().then((data) => {
        if (data === true) {
          this.setLocationAccessState(true);
          observer.next(data);
        } else {
          this.setLocationAccessState(false);
          observer.error(data);
        }
      }).catch((reason) => {
        observer.error(reason);
      });
    });
  }

  public permitLocation() {
    return new Observable(observer => {
      const devicePlatform = this.sharedService.getDevicePlatform();
      if (devicePlatform === 'ios') {
        this.diagnostic.getLocationAuthorizationStatus().then((status) => {
          if (status === this.diagnostic.permissionStatus.GRANTED) {
            this.setLocationAccessState(true);
            observer.next(status);
          } else if (
            (status === this.diagnostic.permissionStatus.DENIED_ONCE)
            || (status === this.diagnostic.permissionStatus.DENIED_ALWAYS)
          ) {
            this.setLocationAccessState(false);
            observer.next(status);
          } else if (
            (status === this.diagnostic.permissionStatus.NOT_REQUESTED)
            || (status.toLowerCase() === 'not_determined')
          ) {
            this.requestLocationAuthorization().subscribe((result) => {
              observer.next(result);
            }, (err) => {
              observer.error(err);
            });
          }
        }, (err) => {
          observer.error(err);
        }).catch((reason) => {
          observer.error(reason);
        });
      } else if (devicePlatform === 'android') {
        this.requestLocationAuthorization().subscribe((result) => {
          observer.next(result);
        }, (err) => {
          observer.error(err);
        });
      }
    });
  }

  public requestLocationAuthorization() {
    return new Observable((observer) => {
      this.diagnostic.requestLocationAuthorization().then((data) => {
          console.log('Permission data');
          console.log(data);
          if (data === this.diagnostic.permissionStatus.GRANTED) {
            this.setLocationAccessState(true);
            observer.next(data);
          } else {
            this.setLocationAccessState(false);
            observer.next(data);
          }
        }, (err) => {
          observer.error(err);
        }).catch((reason) => {
          observer.error(reason);
        });
    });
  }

  public checkCameraPermission() {
    return new Observable(observer => {
      this.diagnostic.isCameraAuthorized(true).then((data) => {
        if (data === true) {
          observer.next(data);
        } else {
          observer.error(data);
        }
      }, (err) => {
        observer.error(err);
      }).catch((reason) => {
        observer.error(reason);
      });
    });
  }

  public permitCamera() {
    return new Observable(observer => {
      const devicePlatform = this.sharedService.getDevicePlatform();
      if (devicePlatform === 'ios') {
        this.diagnostic.getCameraAuthorizationStatus(true).then((status) => {
          if (status === this.diagnostic.permissionStatus.GRANTED) {
            observer.next(status);
          } else if (
            (status === this.diagnostic.permissionStatus.DENIED_ONCE)
            || (status === this.diagnostic.permissionStatus.DENIED_ALWAYS)
          ) {
            observer.next(status);
          } else if (
            (status === this.diagnostic.permissionStatus.NOT_REQUESTED)
            || (status.toLowerCase() === 'not_determined')
          ) {
            this.requestCameraAuthorization().subscribe((result) => {
              observer.next(result);
            }, (err) => {
              observer.error(err);
            });
          }
        }, (err) => {
          observer.error(err);
        }).catch((reason) => {
          observer.error(reason);
        });
      } else if (devicePlatform === 'android') {
        this.requestCameraAuthorization().subscribe((result) => {
          observer.next(result);
        }, (err) => {
          observer.error(err);
        });
      }
    });
  }

  public requestCameraAuthorization() {
    return new Observable((observer) => {
      this.diagnostic.requestCameraAuthorization(true).then((data) => {
        observer.next(data);
      }, (err) => {
        observer.error(err);
      }).catch((reason) => {
        observer.error(reason);
      });
    });
  }

  public checkExternalStoragePermission() {
    return new Observable(observer => {
      const devicePlatform = this.sharedService.getDevicePlatform();
      if (devicePlatform === 'ios') {
        observer.next(true);
      } else if (devicePlatform === 'android') {
        this.androidPermissions.requestPermission(
          this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
        ).then((data) => {
          this.diagnostic.isExternalStorageAuthorized().then((dataEx) => {
            if (dataEx === true) {
              observer.next(dataEx);
            } else {
              observer.error(dataEx);
            }
          }, (err) => {
            observer.error(err);
          }).catch((reason) => {
            observer.error(reason);
          });
        }, (err) => {
          observer.error(err);
        }).catch((reason) => {
          observer.error(reason);
        });
      }
    });
  }

  public permitExternalStorage() {
    return new Observable(observer => {
      const devicePlatform = this.sharedService.getDevicePlatform();
      if (devicePlatform === 'ios') {
        observer.next(true);
      } else if (devicePlatform === 'android') {
        this.diagnostic.requestExternalStorageAuthorization().then((data) => {
          observer.next(data);
        }, (err) => {
          observer.error(err);
        }).catch((reason) => {
          observer.error(reason);
        });
      }
    });
  }

  public gotoAppSettings() {
    return new Observable(observer => {
      this.diagnostic.switchToSettings().then((result) => {
        observer.next(result);
      }, (err) => {
        observer.error(err);
      }).catch((reason) => {
        observer.error(reason);
      });
    });
  }

  private locationChangeHandler() {
    this.diagnostic.registerLocationStateChangeHandler((locationState) => {
      console.log('The Location State Changed :-');
      console.log(locationState);
      const devicePlatform = this.sharedService.getDevicePlatform();
      if (
        (
          (devicePlatform === 'android')
          && (locationState === this.diagnostic.locationMode.LOCATION_OFF)
        )
        || (
          (devicePlatform === 'ios')
          && (
            (locationState === this.diagnostic.permissionStatus.DENIED_ONCE)
            || (locationState === this.diagnostic.permissionStatus.DENIED_ALWAYS)
          )
        )
      ) {
        this.setLocationAccessState(false);
      } else {
        this.setLocationAccessState(true);
      }
    });
  }

  private setLocationAccessState(state: boolean = true) {
    console.log('Location State Setter :- ' + state);
    if (state != null) {
      this.locationAccessAvailable = state;
    }
  }

}
