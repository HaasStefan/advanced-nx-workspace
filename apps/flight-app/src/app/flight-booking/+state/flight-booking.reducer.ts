import { Flight } from '@flight-workspace/flight-lib';
import { Action, createReducer, on } from '@ngrx/store';
import * as FlightBookingActions from './flight-booking.actions';

export const flightBookingFeatureKey = 'flightBooking';


export interface FlightBookingAppState {
  [flightBookingFeatureKey]: State // flightBooking: State
}

export interface State {
  flights: Flight[],
  blackList: number[],
}

export const initialState: State = {
 flights: [],
 blackList: []
};

export const reducer = createReducer(
  initialState,

  on(FlightBookingActions.flightBookingFlightBookings, state => state),

  on(FlightBookingActions.flightsLoaded, (currentState, action) => {
    const flights = action.flights;

    // mutation!!!
    // currentState.flights = flights;
    // return currentState

    return {
      ...currentState,
      flights
    }
  }),

  on(FlightBookingActions.updateFlights, (currentState, action) => {
    const flights = currentState.flights.map(value => value.id === action.flight.id ? action.flight : value);
    return {
      ...currentState,
      flights
    }
  })

);
