import { createFeatureSelector, createSelector } from '@ngrx/store';
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

export const selectFilteredFlights = createSelector(
  selectFlights,
  selectBlacklist,
  (flights, blackList) => flights.filter(f => !blackList.includes(f.id))
)

export const selectFlightsWithParams = (id: number) => createSelector(
  selectFlights,
  (flights) => flights.filter(f => f.id === id)
);