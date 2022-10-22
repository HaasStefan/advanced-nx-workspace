import { Flight } from '@flight-workspace/flight-lib';
import { createAction, props } from '@ngrx/store';

export const flightBookingFlightBookings = createAction(
  '[FlightBooking] FlightBooking FlightBookings'
);


export const flightsLoaded = createAction(
  '[FlightBooking] Flights Loaded',
  props<{flights: Flight[]}>()
);

export const updateFlights = createAction(
  '[FlightBooking] Update Flights',
  props<{flight: Flight}>()
);

export const loadFlights = createAction(
  '[FlightBooking] Load Flights',
  props<{from: string, to: string, urgent: boolean}>()
)

export const loadFlightsError = createAction(
  '[FlightBooking] Load Flights Error'
);