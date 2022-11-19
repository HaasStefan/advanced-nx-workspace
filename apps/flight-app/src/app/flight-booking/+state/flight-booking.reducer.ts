import { Flight } from '@flight-workspace/flight-lib';
import { Action, createReducer, on } from '@ngrx/store';
import * as FlightBookingActions from './flight-booking.actions';


export const flightBookingFeatureKey = 'flightBooking';

export interface FlightBookingAppState {
  [flightBookingFeatureKey]: State, // flightBooking: State,
}

export interface State {
  flights: Flight[];
  blackList: number[];
}

export const initialState: State = {
  flights: [],
  blackList: [3]
};

export const reducer = createReducer(
  initialState,

  on(FlightBookingActions.flightBookingFlightBookings, state => state),

  on(FlightBookingActions.flightsLoaded, (currentState, action) => {

    const flights = action.flights;

    return {
      ...currentState,
      flights
    };
    // Mutation!!!
    // currentState.flights = action.flights;
    // return currentState;
  })

);
