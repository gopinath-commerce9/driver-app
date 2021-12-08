import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { OrderSelectorPage } from './order-selector.page';

const routes: Routes = [
  {
    path: '',
    component: OrderSelectorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderSelectorPageRoutingModule {}
