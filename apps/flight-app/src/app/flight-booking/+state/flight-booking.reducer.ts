import { Action, createReducer, on } from '@ngrx/store';
import * as FlightBookingActions from './flight-booking.actions';

export const flightBookingFeatureKey = 'flightBooking';

export interface FlightBookingAppState {
  [flightBookingFeatureKey]: State
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface State {

}

export const initialState: State = {

};

export const reducer = createReducer(
  initialState,

  on(FlightBookingActions.flightBookingFlightBookings, state => state),

);
