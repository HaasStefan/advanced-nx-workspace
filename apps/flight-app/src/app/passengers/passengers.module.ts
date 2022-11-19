import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import * as fromPassenger from './passenger.reducer';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    StoreModule.forFeature(fromPassenger.passengersFeatureKey, fromPassenger.reducer)
  ]
})
export class PassengersModule { }
