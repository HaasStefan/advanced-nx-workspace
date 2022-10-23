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

  constructor(private injector: Injector) {
    const ce = createCustomElement(DashboardTileComponent, {injector: this.injector});
    customElements.define('dashboard-tile', ce);
  }

}
