import { createFeatureSelector, createSelector } from '@ngrx/store';
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

export const selectWhitelist = createSelector(
  selectFlights,
  selectBlackList,
  (flights, blacklist) => flights.filter(f => !blacklist.includes(f.id))
);


export const selectFlight = (id: number) => createSelector(
  selectFlights,
  (flights) => flights.filter(f => f.id === id)
);