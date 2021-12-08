import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { HeaderComponent } from './header/header.component';

const PAGES_COMPONENTS = [
  /* HeaderComponent */
];

@NgModule({
  declarations: [
    PAGES_COMPONENTS
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule.forRoot(),
  ],
  exports: [
    PAGES_COMPONENTS
  ],
  entryComponents: [],
})
export class ComponentsModule { }
