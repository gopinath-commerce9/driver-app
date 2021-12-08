import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeliveryLocatorPageRoutingModule } from './delivery-locator-routing.module';

import { DeliveryLocatorPage } from './delivery-locator.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeliveryLocatorPageRoutingModule
  ],
  declarations: [DeliveryLocatorPage]
})
export class DeliveryLocatorPageModule {}
