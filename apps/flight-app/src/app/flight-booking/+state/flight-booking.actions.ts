import { Flight } from '@flight-workspace/flight-lib';
import { createAction, props } from '@ngrx/store';
import { FligthDto } from './enities';

export const flightBookingFlightBookings = createAction(
  '[FlightBooking] FlightBooking FlightBookings'
);

export const flightsLoaded = createAction(
  '[FlightBooking] FlightsLoaded',
  props<{ flights: Flight[] }>()
);

export const updateFlight = createAction(
  '[FlightBooking] UpdateFlight',
  props<{ flight: Flight }>()
);

export const loadFlightDto = createAction(
  '[FlightBooking] LoadFlightDto',
  props<{ id: string }>()
);

export const normalizeFlightDto = createAction(
  '[FlightBooking] NormalizeFlightDto',
  props<{ flightDto: FligthDto }>()
);


export const loadFlight = createAction(
  '[FlightBooking] LoadFlight',
  props<{ from: string, to: string, urgent: boolean }>()
);
