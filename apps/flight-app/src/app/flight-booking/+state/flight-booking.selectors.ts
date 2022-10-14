import { createFeatureSelector, createSelector } from '@ngrx/store';
import { id } from '@swimlane/ngx-charts';
import * as fromFlightBooking from './flight-booking.reducer';

export const selectFlightBookingState = createFeatureSelector<fromFlightBooking.State>(
  fromFlightBooking.flightBookingFeatureKey
);


export const selectFlights = createSelector(
  selectFlightBookingState,
  (state) => state.flights
);

export const selectBlackList = createSelector(
  selectFlightBookingState,
  (state) => state.blackList
);

export const selectWhiteList = createSelector(
  selectFlights,
  selectBlackList,
  (flights, blackList) => flights.filter(f => !blackList.includes(f.id))
);

export const selectFlightWithParams = (ids: number[]) => createSelector(
  selectFlights,
  (flights) => flights.filter(f => ids.includes(f.id))
);