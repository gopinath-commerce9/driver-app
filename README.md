## GoodBasket Driver App

### About this repo

This repo is the code of an Ionic 5 Mobile App for Delivery drivers of GoodBasket.

### Preconditions

* NodeJS >= v14.17.6
* NPM >= v6.14.15
* Ionic CLI >= 6.17.1
* Cordova CLI >= 10.0.0
* Angular CLI >= 12.1.4
* Ionic Framework = @ionic/angular 5.9.2
* Android SDK Tools >= 26.1.1 (for Android Platform)
* XCode >= 13 (for iOS Platform)

### Install this Ionic 5 Mobile App

To install NodeJS :
- [NodeJS Download](https://nodejs.org/en/download/)

To install the latest Ionic and Cordova packages :

```
sudo npm install -g ionic cordova
```

To install other dependency packages :

```
npm install
```

### Supported Platforms

* iOS (CLI code 'ios')
* Android (CLI code 'android')

### Add the Platforms

```
ionic cordova platform add <platform>
```

### Generate the Icons and Splash images

```
ionic cordova resources --force --no-cordova-res <platform>
```

### Build the source code for Platforms

For normal build :

```
ionic cordova build <platform>
```

For production build :

```
ionic cordova build --prod <platform>
```
