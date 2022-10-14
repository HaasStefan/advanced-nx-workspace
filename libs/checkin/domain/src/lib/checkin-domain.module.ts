import * as fromPassenger from './+state/passenger/passenger.reducer';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PassengerEffects } from './+state/passenger/passenger.effects';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forFeature(
      fromPassenger.PASSENGER_FEATURE_KEY,
      fromPassenger.reducer
    ),
    EffectsModule.forFeature([PassengerEffects]),
  ],
})
export class CheckinDomainModule {}
