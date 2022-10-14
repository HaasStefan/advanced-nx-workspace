import { Flight } from '@flight-workspace/flight-lib';
import { Action, createReducer, on } from '@ngrx/store';
import * as FlightBookingActions from './flight-booking.actions';

export const flightBookingFeatureKey = 'flightBooking';

export interface State {
flights: Flight[],
blackList: number[]
}

export const initialState: State = {
 flights: [],
 blackList: [3]
};

export interface FlightBookingAppState {
  [flightBookingFeatureKey]: State
}

export const reducer = createReducer(
  initialState,

  on(FlightBookingActions.flightBookingFlightBookings, state => state),

  on(FlightBookingActions.flightsLoaded, (state, action) => {
    //state.flights = action.flights;
    const flights = action.flights;
    return {...state, flights};
  })

);
