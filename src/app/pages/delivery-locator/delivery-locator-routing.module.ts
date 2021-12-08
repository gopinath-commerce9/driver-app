import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeliveryLocatorPage } from './delivery-locator.page';

const routes: Routes = [
  {
    path: '',
    component: DeliveryLocatorPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeliveryLocatorPageRoutingModule {}
