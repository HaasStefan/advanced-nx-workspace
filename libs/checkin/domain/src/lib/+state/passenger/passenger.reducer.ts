import { createReducer, on, Action } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

import * as PassengerActions from './passenger.actions';
import { Passenger } from '../../entities/passenger';

export const PASSENGER_FEATURE_KEY = 'checkin-passenger';

export interface State extends EntityState<Passenger> {
  selectedId?: string | number; // which Passenger record has been selected
  loaded: boolean; // has the Passenger list been loaded
  error?: string | null; // last known error (if any)
}

export interface PassengerPartialState {
  readonly [PASSENGER_FEATURE_KEY]: State;
}

export const passengerAdapter: EntityAdapter<Passenger> =
  createEntityAdapter<Passenger>();

export const initialState: State = passengerAdapter.getInitialState({
  // set initial required properties
  loaded: false,
});

const passengerReducer = createReducer(
  initialState,
  on(PassengerActions.loadPassenger, (state) => ({
    ...state,
    loaded: false,
    error: null,
  })),
  on(PassengerActions.loadPassengerSuccess, (state, { passenger }) =>
    passengerAdapter.upsertMany(passenger, { ...state, loaded: true })
  ),
  on(PassengerActions.loadPassengerFailure, (state, { error }) => ({
    ...state,
    error,
  }))
);

export function reducer(state: State | undefined, action: Action) {
  return passengerReducer(state, action);
}
