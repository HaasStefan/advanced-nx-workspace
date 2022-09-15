import {CommonModule} from '@angular/common';
import {ModuleWithProviders, NgModule} from '@angular/core';

@NgModule({
  imports: [
    CommonModule
  ]
})
export class FlightLibModule {
  static forRoot(): ModuleWithProviders<FlightLibModule> {
    return {
      ngModule: FlightLibModule,
      providers: []
    }
  }
}

