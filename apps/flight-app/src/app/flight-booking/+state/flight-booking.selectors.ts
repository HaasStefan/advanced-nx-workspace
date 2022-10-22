import { Flight } from '@flight-workspace/flight-lib';
import { createFeatureSelector, createSelector, DefaultProjectorFn } from '@ngrx/store';
import * as fromFlightBooking from './flight-booking.reducer';

export const selectFlightBookingState = createFeatureSelector<fromFlightBooking.State>(
  fromFlightBooking.flightBookingFeatureKey
);


export const selectFlights = createSelector(
  selectFlightBookingState,
  (state) => state.flights
);

export const selectBlacklist = createSelector(
  selectFlightBookingState,
  (state) => state.blackList
);

export const selectWhitelist = createSelector(
  selectFlights,
  selectBlacklist,
  (flights, blackList) => flights.filter(f => !blackList.includes(f.id))
);

export const selectFlightsWithParams = (id: number) => createSelector(
  selectWhitelist,
  (flights) => flights.filter(f => f.id === id)
);
