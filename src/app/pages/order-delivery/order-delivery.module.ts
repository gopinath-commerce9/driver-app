import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderDeliveryPageRoutingModule } from './order-delivery-routing.module';

import { OrderDeliveryPage } from './order-delivery.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderDeliveryPageRoutingModule
  ],
  declarations: [OrderDeliveryPage]
})
export class OrderDeliveryPageModule {}
