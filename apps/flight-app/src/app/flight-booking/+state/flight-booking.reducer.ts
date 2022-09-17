import { Flight } from '@flight-workspace/flight-lib';
import { Action, createReducer, on } from '@ngrx/store';
import * as FlightBookingActions from './flight-booking.actions';

export const flightBookingFeatureKey = 'flightBooking';

export interface FlightBookingAppState {
  [flightBookingFeatureKey]: State;
}

export interface State {
  flights: Flight[];
}

export const initialState: State = {
  flights: [],
};

export const reducer = createReducer(
  initialState,

  on(FlightBookingActions.flightBookingFlightBookings, (state) => state),

  on(FlightBookingActions.flightsLoaded, (state, action) => {
    const flights = [...action.flights];
    return {
      ...state,
      flights,
    };
  }),

  on(FlightBookingActions.updateFlight, (state, { flight }) => {
    const flights = state.flights.map((f) => (f.id === flight.id ? flight : f));
    return {
      ...state,
      flights,
    };
  })

  // NGRX-immer
  // https://github.com/timdeschryver/ngrx-immer
  //
  // immerOn(FlightBookingActions.flightsLoaded, (state, action) => {
  //   state.flights = [...action.flights];
  //   return state;
  // })
);
