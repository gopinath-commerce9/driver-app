import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { LocationGuard } from './guards/location.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'splash',
    pathMatch: 'full'
  },
  {
    path: 'splash',
    loadChildren: () => import('./pages/splash/splash.module').then( m => m.SplashPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
  },
  {
    path: 'menu',
    loadChildren: () => import('./pages/menu/menu.module').then( m => m.MenuPageModule),
    canActivate: [LocationGuard]
  },
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [LocationGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule),
    canActivate: [LocationGuard]
  },
  {
    path: 'account',
    loadChildren: () => import('./pages/account/account.module').then( m => m.AccountPageModule),
    canActivate: [LocationGuard]
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then( m => m.NotificationsPageModule),
    canActivate: [LocationGuard]
  },
  {
    path: 'deliveries',
    loadChildren: () => import('./pages/deliveries/deliveries.module').then( m => m.DeliveriesPageModule),
    canActivate: [LocationGuard]
  },
  {
    path: 'delivered',
    loadChildren: () => import('./pages/delivered/delivered.module').then( m => m.DeliveredPageModule),
    canActivate: [LocationGuard]
  },
  {
    path: 'order-selector',
    loadChildren: () => import('./pages/order-selector/order-selector.module').then( m => m.OrderSelectorPageModule),
    canActivate: [LocationGuard]
  },
  {
    path: 'order-details',
    loadChildren: () => import('./pages/order-details/order-details.module').then( m => m.OrderDetailsPageModule),
    canActivate: [LocationGuard]
  },
  {
    path: 'delivery-locator',
    loadChildren: () => import('./pages/delivery-locator/delivery-locator.module').then( m => m.DeliveryLocatorPageModule),
    canActivate: [LocationGuard]
  },
  {
    path: 'order-delivery',
    loadChildren: () => import('./pages/order-delivery/order-delivery.module').then( m => m.OrderDeliveryPageModule)
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
