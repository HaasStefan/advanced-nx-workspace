/* eslint-disable @typescript-eslint/no-unused-vars */
import { NgModule, Injector } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createCustomElement } from '@angular/elements';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DashboardTileComponent } from './dashboard-tile.component';

@NgModule({
  imports: [
    CommonModule,
    NgxChartsModule
  ],
  declarations: [
    DashboardTileComponent
  ],
  exports: [
    DashboardTileComponent
  ]
})
export class DashboardTileModule {

  constructor(injector: Injector) {
    const elem = createCustomElement(DashboardTileComponent, {injector});
    customElements.define('dashboard-tile', elem);
  }

}






    // const tile = createCustomElement(DashboardTileComponent, {injector});
    // customElements.define('dashboard-tile', tile);
