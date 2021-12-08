import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderDeliveryPage } from './order-delivery.page';

const routes: Routes = [
  {
    path: '',
    component: OrderDeliveryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderDeliveryPageRoutingModule {}
