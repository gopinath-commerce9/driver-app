import { NgModule } from '@angular/core';
import { RouterModule, Routes, Route, PreloadAllModules, NoPreloading } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { timeout, switchMap, map, mergeMap, concatMap, catchError, delay, tap } from 'rxjs/operators';

import { TabItemInterface } from './../../interfaces/tab-item';
import { TabsPageService } from './../../services/tabs-page.service';
import { TabsPage } from './tabs.page';

const tabRoute: Route = {
  path: '',
  component: TabsPage,
  children: []
};

const tabList = TabsPageService.prepareTabItems();
const lazyMap: Map<string, Promise<unknown>> = new Map();

if (tabList.length > 0) {
  tabList.forEach((currentTabItem: TabItemInterface, currentTabIndex: number) => {
    const tabChildren: Route[] = [{
      path: '',
      loadChildren: () => import('./../' + currentTabItem.modulePath).then(m => currentTabItem.moduleClass)
    }];
    tabRoute.children.push({ path: currentTabItem.tabUrl, children: tabChildren });
  });
  tabRoute.children.push({ path: '', redirectTo: 'tabs/'  + tabList[0].tabUrl, pathMatch: 'full' });
}

const routes: Routes = [tabRoute, { path: '', redirectTo: 'tabs/'  + tabList[0].tabUrl, pathMatch: 'full' }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
