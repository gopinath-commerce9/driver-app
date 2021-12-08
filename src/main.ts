import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { appConfigs } from './app/configs/app.configs';

const apiSettings = appConfigs.api[appConfigs.env];

let mainUrl = appConfigs.mapApiUrl;
const gApiKey = apiSettings.googleApiKey;
const mapUrlParams: any[] = [
  { key: 'key', value: gApiKey },
  { key: 'libraries', value: 'places' },
];
if (mapUrlParams.length > 0) {
  mainUrl += '?';
  mapUrlParams.forEach((params: any, paramIndex: number) => {
    mainUrl += ((paramIndex > 0) ? '&' : '') + params.key + '=' + params.value;
  });
}
const googleMapsScript = document.createElement('script');
googleMapsScript.type = 'text/javascript';
googleMapsScript.src = mainUrl;
document.getElementsByTagName('head')[0].appendChild(googleMapsScript);

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
