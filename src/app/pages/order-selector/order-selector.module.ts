import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderSelectorPageRoutingModule } from './order-selector-routing.module';

import { OrderSelectorPage } from './order-selector.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrderSelectorPageRoutingModule
  ],
  declarations: [OrderSelectorPage]
})
export class OrderSelectorPageModule {}
