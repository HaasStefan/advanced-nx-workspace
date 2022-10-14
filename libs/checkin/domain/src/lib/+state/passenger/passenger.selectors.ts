import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  PASSENGER_FEATURE_KEY,
  State,
  PassengerPartialState,
  passengerAdapter,
} from './passenger.reducer';

// Lookup the 'Passenger' feature state managed by NgRx
export const getPassengerState = createFeatureSelector<
  PassengerPartialState,
  State
>(PASSENGER_FEATURE_KEY);

const { selectAll, selectEntities } = passengerAdapter.getSelectors();

export const getPassengerLoaded = createSelector(
  getPassengerState,
  (state: State) => state.loaded
);

export const getPassengerError = createSelector(
  getPassengerState,
  (state: State) => state.error
);

export const getAllPassenger = createSelector(
  getPassengerState,
  (state: State) => selectAll(state)
);

export const getPassengerEntities = createSelector(
  getPassengerState,
  (state: State) => selectEntities(state)
);

export const getSelectedId = createSelector(
  getPassengerState,
  (state: State) => state.selectedId
);

export const getSelected = createSelector(
  getPassengerEntities,
  getSelectedId,
  (entities, selectedId) => selectedId && entities[selectedId]
);
